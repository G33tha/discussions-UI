import { NSDiscussData } from './../../models/discuss.model';
import { TelemetryUtilsService } from './../../telemetry-utils.service';
import { DiscussionService } from './../../services/discussion.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as CONSTANTS from './../../common/constants.json';

/* tslint:disable */
import * as _ from 'lodash'
import { first } from 'rxjs/operators';
/* tslint:enable */

@Component({
  selector: 'lib-side-pannel',
  templateUrl: './side-pannel.component.html',
  styleUrls: ['./side-pannel.component.scss']
})
export class SidePannelComponent implements OnInit, OnDestroy {

  paramsSubscription: Subscription;

  userName: string;

  defaultPage = 'categories';

  queryParams: any;
  hideSidePanel: boolean;

  selectedTab: string;
  showSideMenu: Boolean = true;
  menu: any;


  constructor(
    public router: Router,
    public discussService: DiscussionService,
    public activatedRoute: ActivatedRoute,
    private telemetryUtils: TelemetryUtilsService,
  ) { }

  ngOnInit() {
    // TODO: loader or spinner
    this.hideSidePanel = document.body.classList.contains('widget');
    this.telemetryUtils.logImpression(NSDiscussData.IPageName.HOME);
    this.paramsSubscription = this.activatedRoute.queryParams.pipe(first()).subscribe((params) => {
      this.queryParams = params;
      this.discussService.userName = _.get(params, 'userName');
      const rawCategories = JSON.parse(_.get(params, 'categories'));
      this.discussService.forumIds = _.get(rawCategories, 'result');
    });

    localStorage.setItem('userName', _.get(this.queryParams, 'userName'));
    this.discussService.initializeUserDetails(localStorage.getItem('userName'));
    this.activatedRoute.data.subscribe((data) => {
      this.menu = data.menuOptions.length > 0 ? data.menuOptions: CONSTANTS.MENUOPTIONS
    })
    for (let i = 0; i < this.menu.length; i++) {
      let item = this.menu
      if (!item[i].enable) {
        this.menu.splice(i, 1)
      }
    }
    if (this.discussService.forumIds) {
      // this.navigate(this.defaultPage);
    } else {
      // TODO: Error toast
      console.log('forum ids not found');
    }
  }

  isActive(selectedItem) {
    debugger
    if(this.router.url.indexOf(`/${selectedItem}`) > -1 || this.selectedTab === selectedItem){
      return true
    }
    return false
  }

  navigate(pageName: string, event?) {
    this.selectedTab = pageName;
    this.telemetryUtils.setContext([]);
    if (event) {
      this.telemetryUtils.logInteract(event, NSDiscussData.IPageName.HOME);
    }
    this.router.navigate([`${CONSTANTS.ROUTES.DISCUSSION}${pageName}`], { queryParams: this.queryParams });
  }

  ngOnDestroy() {
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
  }

  showMenuButton() {
    this.showSideMenu = this.showSideMenu ? false : true;
  }

  closeNav() {
    this.showSideMenu = this.showSideMenu ? false : true;
  }

}
