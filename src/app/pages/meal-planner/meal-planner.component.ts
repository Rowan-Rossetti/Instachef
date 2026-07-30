import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

interface PlannerRecipe {
  title: string;
  category?: string;
}

interface MealSelection {
  entree: string;
  plat: string;
  dessert: string;
}

type TimeName = 'Midi' | 'Soir';
type DayMeals = Record<TimeName, MealSelection>;
type WeeklyMeals = Record<string, DayMeals>;

const STORAGE_PREFIX = 'mealPlanner:';

@Component({
  selector: 'app-meal-planner',
  templateUrl: './meal-planner.component.html',
  styleUrls: ['./meal-planner.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, HeaderComponent, FooterComponent],
})
export class MealPlannerComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  readonly days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  readonly times: TimeName[] = ['Midi', 'Soir'];

  createdRecipes: PlannerRecipe[] = [];
  meals: WeeklyMeals = {};
  weekStart = this.getMonday(new Date());

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.resetModel();
    this.loadRecipes();
    this.loadWeek();
  }

  get weekLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);

    const startText = this.weekStart.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
    const endText = end.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `Du ${startText} au ${endText}`;
  }

  previousWeek(): void {
    this.changeWeek(-7);
  }

  nextWeek(): void {
    this.changeWeek(7);
  }

  currentWeek(): void {
    this.weekStart = this.getMonday(new Date());
    this.resetModel();
    this.loadWeek();
  }

  saveMeals(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.meals));
    } catch {
      // Le planificateur reste utilisable même si le stockage du navigateur est indisponible.
    }
  }

  duplicateDay(day: string): void {
    const sourceIndex = this.days.indexOf(day);
    const destination = this.days[sourceIndex + 1];

    if (sourceIndex < 0 || !destination) return;

    this.meals[destination] = this.cloneDay(this.meals[day]);
    this.saveMeals();
  }

  recipesByCategory(category: string): PlannerRecipe[] {
    const normalizedCategory = this.normalizeText(category);
    const matchingRecipes = this.createdRecipes.filter(
      recipe => this.normalizeText(recipe.category || '') === normalizedCategory,
    );

    return matchingRecipes.length > 0 ? matchingRecipes : this.createdRecipes;
  }

  printPlanner(): void {
    if (this.isBrowser) window.print();
  }

  async downloadPdf(): Promise<void> {
    if (!this.isBrowser) return;

    const exportSheet = this.createPdfExportSheet();
    document.body.appendChild(exportSheet);

    try {
      await this.waitForBrowserPaint();

      const { default: html2pdf } = await import('html2pdf.js');

      await html2pdf()
        .set({
          margin: 0,
          filename: `menu-${this.localIsoDate}.pdf`,
          image: { type: 'png', quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: 1122,
            height: 794,
            windowWidth: 1122,
            windowHeight: 794,
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        })
        .from(exportSheet)
        .save();
    } finally {
      exportSheet.remove();
    }
  }

  downloadWord(): void {
    if (!this.isBrowser) return;

    const rows = this.days
      .map((day, index) => {
        const mealCells = this.times
          .map(time => {
            const meal = this.meals[day][time];
            return `
              <td class="meal-cell">
                <div class="meal-title">${time}</div>
                ${this.wordMealLine('Entrée', meal.entree)}
                ${this.wordMealLine('Plat', meal.plat)}
                ${this.wordMealLine('Dessert', meal.dessert)}
              </td>`;
          })
          .join('');

        return `
          <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
            <th class="day-cell">
              <span class="day-index">${String(index + 1).padStart(2, '0')}</span>
              <span class="day-name">${day}</span>
            </th>
            ${mealCells}
          </tr>`;
      })
      .join('');

    const html = `<!doctype html>
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>Menu de la semaine</title>
          <style>
            @page Section1 {
              size: 29.7cm 21cm;
              margin: 0.45cm;
              mso-page-orientation: landscape;
            }
            div.Section1 { page: Section1; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #2d2926;
              background: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
            }
            .sheet {
              width: 28.8cm;
              height: 20.05cm;
              overflow: hidden;
            }
            .header {
              height: 1.7cm;
              padding: 0.28cm 0.5cm;
              border-radius: 0.18cm;
              background: #b9583a;
              color: #ffffff;
              text-align: center;
            }
            .brand {
              margin: 0 0 0.08cm;
              font-size: 7pt;
              font-weight: 700;
              letter-spacing: 0.18cm;
              text-transform: uppercase;
            }
            h1 {
              margin: 0;
              font-size: 17pt;
              line-height: 1;
            }
            .period {
              margin: 0.1cm 0 0;
              color: #f9eae3;
              font-size: 8pt;
            }
            table {
              width: 100%;
              height: 17.95cm;
              margin-top: 0.35cm;
              border: 1px solid #d7c8bf;
              border-collapse: collapse;
              table-layout: fixed;
            }
            thead tr { height: 0.72cm; }
            tbody tr { height: 2.46cm; mso-height-source: exactly; page-break-inside: avoid; }
            th, td {
              border: 1px solid #d7c8bf;
              padding: 0;
              overflow: hidden;
              vertical-align: middle;
            }
            thead th {
              background: #efe4dc;
              color: #675d57;
              font-size: 7pt;
              font-weight: 700;
              letter-spacing: 0.08cm;
              text-align: center;
              text-transform: uppercase;
            }
            thead .day-column { width: 14%; }
            thead .meal-column { width: 43%; }
            .row-even td { background: #fffdfb; }
            .row-odd td { background: #fbf6f2; }
            .day-cell {
              width: 14%;
              padding: 0.18cm;
              background: #f4e9e2;
              text-align: center;
            }
            .day-index {
              display: block;
              margin: 0 auto 0.06cm;
              color: #b9583a;
              font-size: 6pt;
              font-weight: 700;
            }
            .day-name {
              display: block;
              color: #302b28;
              font-size: 10pt;
              font-weight: 700;
              white-space: nowrap;
            }
            .meal-cell {
              width: 43%;
              padding: 0.13cm 0.18cm;
            }
            .meal-title {
              margin-bottom: 0.08cm;
              color: #b9583a;
              font-size: 7pt;
              font-weight: 700;
              letter-spacing: 0.06cm;
              text-align: center;
              text-transform: uppercase;
            }
            .meal-line {
              width: 100%;
              height: 0.49cm;
              margin: 0.035cm 0;
              overflow: hidden;
              border-radius: 0.08cm;
              background: #ffffff;
              line-height: 0.49cm;
              white-space: nowrap;
            }
            .meal-label {
              display: inline-block;
              width: 1.35cm;
              padding-left: 0.12cm;
              color: #847870;
              font-size: 5.8pt;
              font-weight: 700;
              text-transform: uppercase;
            }
            .meal-value {
              color: #302b28;
              font-size: 7pt;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="Section1 sheet">
            <header class="header">
              <p class="brand">Instachef</p>
              <h1>Menu de la semaine</h1>
              <p class="period">${this.escapeHtml(this.weekLabel)}</p>
            </header>
            <table>
              <thead>
                <tr>
                  <th class="day-column">Jour</th>
                  <th class="meal-column">Midi</th>
                  <th class="meal-column">Soir</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </body>
      </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menu-${this.localIsoDate}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private createPdfExportSheet(): HTMLElement {
    const sheet = document.createElement('section');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'z-index:2147483647',
      'pointer-events:none',
      'width:1122px',
      'height:794px',
      'padding:24px',
      'box-sizing:border-box',
      'overflow:hidden',
      'background:#ffffff',
      'color:#2d2926',
      'font-family:Arial,Helvetica,sans-serif',
    ].join(';');

    const rows = this.days.map((day, index) => {
      const cells = this.times.map(time => {
        const meal = this.meals[day][time];
        return `
          <div style="min-width:0;padding:8px 14px;border-left:1px solid #d7c8bf;overflow:hidden;background:${index % 2 === 0 ? '#fffdfb' : '#fbf6f2'};">
            <div style="margin-bottom:5px;color:#b9583a;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">${time}</div>
            ${this.pdfMealLine('Entrée', meal.entree)}
            ${this.pdfMealLine('Plat', meal.plat)}
            ${this.pdfMealLine('Dessert', meal.dessert)}
          </div>`;
      }).join('');

      return `
        <div style="display:grid;grid-template-columns:148px minmax(0,1fr) minmax(0,1fr);height:82px;border-top:1px solid #d7c8bf;overflow:hidden;">
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;background:#f4e9e2;white-space:nowrap;">
            <span style="margin-bottom:3px;color:#b9583a;font-size:9px;font-weight:700;letter-spacing:.08em;">${String(index + 1).padStart(2, '0')}</span>
            <strong style="font-size:17px;line-height:1;">${day}</strong>
          </div>
          ${cells}
        </div>`;
    }).join('');

    sheet.innerHTML = `
      <header style="height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:14px;background:#b9583a;color:#ffffff;">
        <div style="margin-bottom:5px;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;">Instachef</div>
        <h1 style="margin:0;font-size:30px;line-height:1;">Menu de la semaine</h1>
        <p style="margin:8px 0 0;color:#f9eae3;font-size:13px;">${this.escapeHtml(this.weekLabel)}</p>
      </header>
      <div style="height:638px;margin-top:16px;border:1px solid #d7c8bf;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(79,55,44,.08);">
        <div style="display:grid;grid-template-columns:148px minmax(0,1fr) minmax(0,1fr);height:64px;background:#efe4dc;color:#675d57;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;">
          <div style="display:flex;align-items:center;justify-content:center;">Jour</div>
          <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #d7c8bf;">Midi</div>
          <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #d7c8bf;">Soir</div>
        </div>
        ${rows}
      </div>`;

    return sheet;
  }

  private waitForBrowserPaint(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }

  private pdfMealLine(label: string, value: string): string {
    const text = this.compactExportText(value, 62);
    return `
      <div style="display:grid;grid-template-columns:62px minmax(0,1fr);align-items:center;height:17px;margin:2px 0;overflow:hidden;border-radius:5px;background:#ffffff;">
        <span style="padding-left:7px;color:#847870;font-size:8px;font-weight:700;text-transform:uppercase;">${label}</span>
        <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#302b28;font-size:10px;font-weight:600;">${this.escapeHtml(text)}</span>
      </div>`;
  }

  private changeWeek(dayOffset: number): void {
    const selectedWeek = new Date(this.weekStart);
    selectedWeek.setDate(selectedWeek.getDate() + dayOffset);
    this.weekStart = this.getMonday(selectedWeek);
    this.resetModel();
    this.loadWeek();
  }

  private loadRecipes(): void {
    if (!this.isBrowser) return;

    try {
      const parsed: unknown = JSON.parse(localStorage.getItem('recipes') || '[]');
      this.createdRecipes = Array.isArray(parsed)
        ? parsed
            .filter(recipe => recipe && typeof recipe === 'object' && typeof recipe.title === 'string')
            .map(recipe => ({
              title: String(recipe.title).trim(),
              category: typeof recipe.category === 'string' ? recipe.category : '',
            }))
            .filter(recipe => recipe.title.length > 0)
        : [];
    } catch {
      this.createdRecipes = [];
    }
  }

  private loadWeek(): void {
    if (!this.isBrowser) return;

    try {
      const rawValue = localStorage.getItem(this.storageKey);
      if (!rawValue) return;

      const stored = JSON.parse(rawValue) as Partial<WeeklyMeals>;

      for (const day of this.days) {
        for (const time of this.times) {
          const storedMeal = stored?.[day]?.[time];
          if (!storedMeal) continue;

          this.meals[day][time] = {
            entree: this.safeText(storedMeal.entree),
            plat: this.safeText(storedMeal.plat),
            dessert: this.safeText(storedMeal.dessert),
          };
        }
      }
    } catch {
      this.resetModel();
    }
  }

  private resetModel(): void {
    this.meals = Object.fromEntries(this.days.map(day => [day, this.emptyDay()])) as WeeklyMeals;
  }

  private emptyDay(): DayMeals {
    return {
      Midi: { entree: '', plat: '', dessert: '' },
      Soir: { entree: '', plat: '', dessert: '' },
    };
  }

  private cloneDay(day: DayMeals): DayMeals {
    return {
      Midi: { ...day.Midi },
      Soir: { ...day.Soir },
    };
  }

  private getMonday(date: Date): Date {
    const value = new Date(date);
    value.setHours(12, 0, 0, 0);
    const currentDay = value.getDay() || 7;
    value.setDate(value.getDate() - currentDay + 1);
    return value;
  }

  private get localIsoDate(): string {
    const year = this.weekStart.getFullYear();
    const month = String(this.weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(this.weekStart.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private get storageKey(): string {
    return `${STORAGE_PREFIX}${this.localIsoDate}`;
  }

  private safeText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private wordMealLine(label: string, value: string): string {
    return `<div class="meal-line"><span class="meal-label">${label}</span><span class="meal-value">${this.escapeHtml(this.compactExportText(value, 58))}</span></div>`;
  }

  private compactExportText(value: string, maximumLength: number): string {
    const normalized = value.replace(/\s+/g, ' ').trim() || '—';
    return normalized.length > maximumLength
      ? `${normalized.slice(0, maximumLength - 1).trimEnd()}…`
      : normalized;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, character => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return entities[character] || character;
    });
  }
}
