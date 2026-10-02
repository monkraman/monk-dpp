/**
 * Monk Spaces DPP Platform - Main Entry Point
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import './styles/_design-tokens.scss';
import './styles/styles.scss';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));