import { Component } from '@angular/core';

import { MapPage } from '../map/map';
import { SavedPage } from '../saved/saved';
import { BestPage } from '../best/best';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = MapPage;
  tab2Root = SavedPage;
  tab3Root = BestPage;
  tab4Root = SettingsPage;

  constructor() {

  }
}
