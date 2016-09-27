import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'reactive-view',
  templateUrl: './reactive-view.component.html',
  styleUrls: ['./reactive-view.component.scss']
})
export class ReactiveViewComponent implements OnInit {

  constructor(private _data: DataService) {
  }

  dataSubscription:Subscription;
  actions:any[] = [];
  team:any = {};
  memberIds:any = {};
  speed:number = 5;
  quarter:number = 1;

  isNavigationActive:boolean = true;

  ngOnInit() {
    for (let play of this._data.plays) {
      this._data.display[play] = true;
    }

    for (let i of [1,2]) {
      this._data.display.team[i].team = true;
      this.setMembersTrue(i);
    }

    this.team = this._data.team;
    this.memberIds = {
      1: Object.keys(this.team[1].members),
      2: Object.keys(this.team[2].members)
    };
  }

  onChangeTeam(id:number) {
    if (this._data.display.team[id].team) {
      this.setMembersTrue(id);
    } else {
      this.setMembersFalse(id);
    }
  }

  onClickSubscribe() {
    this.isNavigationActive = false;
    this.unsubscribe();
    this.subscribe();
  }

  onClickUnsubscribe() {
    this.isNavigationActive = true;
    this.unsubscribe();
  }

  //
  // control subscription
  //

  private subscribe() {
    this.actions = [];
    this.dataSubscription = this._data.getObserverForQuarter(+this.quarter, 1.0 / this.speed)
      .subscribe(x => {
        this.actions.push(x);
      }, error => {
        console.error(error);
      }, () => {
        console.info("The quarter is over.");
      });
  }

  private unsubscribe() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  //
  // utility functions
  //

  private getKeys(object:any):any[] {
    return Object.keys(object);
  }

  private setMembersTrue(teamId:number) {
    const team = this._data.team[teamId];
    for (let playerId of this.getKeys(team.members)) {
      this._data.display.team[teamId].member[playerId] = true;
    }
  }

  private setMembersFalse(teamId:number) {
    const team = this._data.team[teamId];
    for (let playerId of this.getKeys(team.members)) {
      this._data.display.team[teamId].member[playerId] = false;
    }
  }


}
