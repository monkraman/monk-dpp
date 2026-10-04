import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { THEME_PRESETS, DEFAULT_THEME_ID, ThemePreset } from '../config/theme.config';

const THEME_STORAGE_KEY = 'dpp_active_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<ThemePreset>(
    THEME_PRESETS[DEFAULT_THEME_ID] || Object.values(THEME_PRESETS)[0]
  );
  currentTheme$: Observable<ThemePreset> = this.currentThemeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  get availableThemes(): ThemePreset[] {
    return Object.values(THEME_PRESETS);
  }

  get currentTheme(): ThemePreset {
    return this.currentThemeSubject.value;
  }

  initTheme(): void {
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    const themeId = savedThemeId && THEME_PRESETS[savedThemeId] ? savedThemeId : DEFAULT_THEME_ID;
    this.setTheme(themeId);
  }

  setTheme(themeId: string): void {
    const preset = THEME_PRESETS[themeId] || THEME_PRESETS[DEFAULT_THEME_ID];
    if (!preset) return;

    this.currentThemeSubject.next(preset);
    localStorage.setItem(THEME_STORAGE_KEY, preset.id);

    // Apply tokens as CSS custom properties to document root
    const root = document.documentElement;
    const c = preset.colors;

    root.style.setProperty('--brand-primary', c.primary);
    root.style.setProperty('--brand-primary-hover', c.primaryHover);
    root.style.setProperty('--brand-primary-light', c.primaryLight);
    root.style.setProperty('--brand-accent', c.accent);
    root.style.setProperty('--brand-accent-hover', c.accentHover);
    root.style.setProperty('--brand-accent-glow', c.accentGlow);
    root.style.setProperty('--bg-page', c.bgPage);
    root.style.setProperty('--bg-surface', c.bgSurface);
    root.style.setProperty('--bg-sidebar', c.bgSidebar);
    root.style.setProperty('--bg-card', c.bgCard);
    root.style.setProperty('--bg-card-hover', c.bgCardHover);
    root.style.setProperty('--text-primary', c.textPrimary);
    root.style.setProperty('--text-secondary', c.textSecondary);
    root.style.setProperty('--text-muted', c.textMuted);
    root.style.setProperty('--border-light', c.borderLight);
    root.style.setProperty('--border-color', c.borderColor);
    root.style.setProperty('--badge-published-bg', c.statusPublishedBg);
    root.style.setProperty('--badge-published-text', c.statusPublishedText);
    root.style.setProperty('--badge-review-bg', c.statusReviewBg);
    root.style.setProperty('--badge-review-text', c.statusReviewText);
    root.style.setProperty('--badge-draft-bg', c.statusDraftBg);
    root.style.setProperty('--badge-draft-text', c.statusDraftText);
    root.style.setProperty('--gradient-primary', c.gradientPrimary);
    root.style.setProperty('--gradient-badge', c.gradientBadge);
  }
}
