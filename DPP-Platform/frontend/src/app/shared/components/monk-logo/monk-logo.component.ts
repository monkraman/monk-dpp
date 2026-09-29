import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monk-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monk-logo" [class.centered]="centered">
      <!-- High-fidelity brand mark matching official Monk Spaces logo -->
      <svg class="logo-mark" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Top & Left segmented arcs in #3B5778 -->
        <!-- Segment 1 (Top Left) -->
        <path d="M12.5 5.5C14.2 4.8 16.1 4.5 18 4.5" stroke="#3B5778" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Segment 2 (Top) -->
        <path d="M21.5 5C24.5 5.8 27.2 7.6 29 10" stroke="#3B5778" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Segment 3 (Top Right) -->
        <path d="M30.8 13.5C31.5 15.5 31.7 17.5 31.5 19.5" stroke="#3B5778" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Segment 4 (Left Upper) -->
        <path d="M5.5 14C6.5 11 8.5 8.5 11 6.8" stroke="#3B5778" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Segment 5 (Left Lower) -->
        <path d="M4.5 18C4.5 21 5.5 24 7.5 26.5" stroke="#3B5778" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Bottom left small lime green segment -->
        <path d="M9.5 29C11.5 30.5 13.8 31.3 16.2 31.5" stroke="#B9CB33" stroke-width="3.5" stroke-linecap="round"/>

        <!-- Leaf shape in Lime Green #B9CB33 -->
        <path d="M18 31.5C25 31.5 31.5 26 31.5 19C31.5 19 25 18.5 20 22C17 24.2 16.5 28 18 31.5Z" fill="#B9CB33"/>
        <!-- Leaf inner vein line -->
        <path d="M18 30C20.5 27.5 24 23.5 29 21" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
      </svg>

      <span class="logo-text" [style.font-size.px]="size">MONK SPACES</span>
    </div>
  `,
  styles: [`
    .monk-logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      user-select: none;

      &.centered {
        justify-content: center;
      }
    }

    .logo-mark {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: #3B5778;
      font-family: var(--font-family);
    }
  `],
})
export class MonkLogoComponent {
  @Input() size = 17;
  @Input() centered = false;
}
