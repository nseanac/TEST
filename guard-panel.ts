import {Component, OnInit, OnDestroy, HostBinding} from '@angular/core';
import {Router} from '@angular/router';
import {animate, trigger, state, style, transition} from '@angular/animations';

import {Subscription} from 'rxjs/Subscription';

import {Store} from '@ngrx/store';

import {GuardPanel} from '../../../application/models/guard.model';

import * as guardStore from 'Store/guard';

import {ExternalizationClass, VACANT} from '../../classes/e13n';
import {ExternalizationService} from '../../services/e13n.service';

// Externalized (polyglot) text values for field labels, input placeholders, button text
// screen reader text, page headings, user instructions, help messages, menu uploads, etc

class E13n {
  cancelButtonText = VACANT;
}

const SELECTOR: string = 'guard-panel';

const slideDown = style({transform: 'translateY(300px)'});
const slideUp = style({transform: 'translateY(0)'});
const animateDefault = animate(500);
const opacityOff = style({opacity: 0});
const opacityOn = style({opacity: 1});

@Component({
  selector: SELECTOR,
  templateUrl: './guard-panel.html',
  styleUrls: ['./guard-panel.scss'],
  animations: [
    trigger('guardState', [
      state('inactive', slideDown),
      state('active', slideUp),
      transition('inactive => active', animateDefault)
    ]),
    trigger('guardBackdropState', [
      state('inactive', opacityOff),
      state('active', opacityOn),
      transition('* => active', animateDefault),
      transition('* => inactive', animateDefault)
    ])
  ]
})
export class GuardPanelComponent extends ExternalizationClass<E13n> implements OnInit, OnDestroy {
  @HostBinding('class.guard-panel-large') public large: boolean = false;

  public mode: string = 'inactive';
  public cancel: boolean = true;
  public guardPanel: GuardPanel;
  private guardPanelSubscription: Subscription;

  public constructor(protected e13nService: ExternalizationService, private router: Router, private store: Store<any>) {
    super(SELECTOR, new E13n, e13nService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.guardPanelSubscription = this.store.select(guardStore.guardPanelSelector).subscribe((guardPanel: GuardPanel) => this.changeMode(guardPanel));
  }

  public ngOnDestroy(): void {
    this.guardPanelSubscription.unsubscribe();
    super.ngOnDestroy();
  }

  public confirmClicked(): void {
    this.store.dispatch(new guardStore.SetConfirmed(true));
  }

  public cancelClicked(): void {
    this.store.dispatch(new guardStore.SetConfirmed(false));
  }

  private changeMode(guardPanel: GuardPanel): void {
    if (!guardPanel) {
      this.large = false;
      this.mode = 'inactive';
    }
    else {
      this.large = guardPanel.large;
      this.mode = 'active';
      this.cancel = guardPanel.cancel;
    }
    this.guardPanel = guardPanel;
  }
}
