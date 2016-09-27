import { Injectable } from '@angular/core';
import { Observable, Scheduler } from 'rxjs';

// 1000 * [ms] => [sec]
const MS_SCALE = 1000;

@Injectable()
export class DataService {

  constructor() { }

  // array of actions
  actions:any[] = [];
  // object to store filtering state
  display:any = {
    team: {1: {member: {}}, 2: {member: {}}}
  };

  // team data
  team:any = {
    1: this.getTeamDataFor(1),
    2: this.getTeamDataFor(2)
  };

  // plays to be displayed
  plays:string[] = [
    "2PT", "3PT", "FT", "ORB", "DRB",
    "AST", "STL", "TOV", "PF", "TF"
  ];

  calcDelay(playTime:number, scale:number) {
    return playTime * MS_SCALE * scale;
  }

  //
  // Information about teams
  //

  getTeamFromAction(action:any) {
    const teamId = action.team;
    return this.team[teamId];
  }

  getTeamNameFromAction(action:any) {
    const team = this.getTeamFromAction(action);
    return team.name;
  }

  //
  // Information about players
  //

  getPlayerFromAction(action:any) {
    const teamId = action.team;
    const playerId = action.player;
    if (playerId) {
      return this.team[teamId].members[playerId];
    } else {
      return null;
    }
  }

  getPlayerNameFromAction(action:any) {
    const player = this.getPlayerFromAction(action);
    if (player) {
      return player.name;
    } else {
      return "TEAM";
    }
  }

  getLatestPlay() {
    const len = this.actions.length;
    return this.actions[len-1] || {};
  }

  getDataForQuarter(q:number):any[] {
    switch (q) {
      case 1:
        return this.getDataFor1Q();
      case 2:
        return this.getDataFor2Q();
      case 3:
        return this.getDataFor3Q();
      case 4:
        return this.getDataFor4Q();
      default:
        return [];
    }
  }

  getObservableForQuarter(q:number):Observable<any> {
    let data = this.getDataForQuarter(q);
    return Observable.from(data);
  }

  getObserverForQuarter(q:number, scale:number) {
    this.actions = [];

    var filter = (x:any):boolean => {
      if (!this.display) {
        return false;
      }

      if (!(this.display.team[x.team] &&
            this.display.team[x.team].member &&
            this.display.team[x.team].member[x.player])) {
        return false;
      }

      if (!this.display[x.attempt]) {
        return false;
      }

      return true;
    };

    var delay = (x:any) => {
      return Observable.interval(this.calcDelay(this.convertTime(x.time), scale));
    }

    var observable = this.getObservableForQuarter(q)
      .delayWhen(delay)
      .filter(filter);

    return observable;
  }


  getTeamDataFor(teamId:number):any {
    switch (teamId) {
      case 1:
        return this.getTeamDataForAlvark();
      case 2:
        return this.getTeamDataForGoldenKings();
    }
  }

  //
  // private functions
  //

  // time string "MM:SS" => number 60 * MM + SS
  private convertTime(time:string):number {
    const timeArray = time.split(':');
    const minute = +timeArray[0];
    const second = +timeArray[1];
    return minute * 60 + second;
  }

  // Data for team 1, Alvark Tokyo
  // NOTE: this should be loaded via external requests in most apps
  private getTeamDataForAlvark():any {
    return {
      "name": "アルバルク東京",
      "eName": "Alvark Tokyo",
      "members": {
        2: {"name": "ディアンテ・ギャレット", "position": "SG"},
        7: {"name": "正中 岳城", "position": "PG"},
        8: {"name": "二ノ宮 康平", "position": "PG"},
        10: {"name": "ザック・バランスキー", "position": "SF"},
        13: {"name": "菊地 祥平", "position": "SF"},
        15: {"name": "竹内 譲次", "position": "PF"},
        16: {"name": "松井 啓十郎", "position": "SG"},
        20: {"name": "アンドリュー・ネイミック", "position": "C"},
        22: {"name": "田村 大輔", "position": "SG"},
        24: {"name": "田中 大貴", "position": "SG"},
        33: {"name": "トロイ・ギレンウォーター", "position": "PF"},
        35: {"name": "伊藤 大司", "position": "PG"}
      }
    };
  }

  // Data for team 2, Ryukyu Golden Kings
  // NOTE: this should be loaded via external api requests in most apps
  private getTeamDataForGoldenKings():any {
    return {
      "name": "琉球ゴールデンキングス",
      "eName": "Ryukyu Golden Kings",
      "members": {
        5: {"name": "アンソニー・マクヘンリー", "position": "SF/PF"},
        6: {"name": "金城 茂之", "position": "SG"},
        8: {"name": "大宮 宏正", "position": "PF"},
        10: {"name": "波多野 和也", "position": "PF/C"},
        13: {"name": "津山 尚大", "position": "PG/SG"},
        14: {"name": "岸本 隆一", "position": "PG/SG"},
        16: {"name": "渡辺 竜之佑", "position": "PG/SG"},
        22: {"name": "モー・チャロー", "position": "SF"},
        24: {"name": "田代 直希", "position": "SF/PF"},
        31: {"name": "喜多川 修平", "position": "SF"},
        32: {"name": "山内 盛久", "position": "PG/SG"},
        34: {"name": "ラモント・ハミルトン", "position": "PF/C"}
      }
    };
  }

  // Data for the first quarter
  // NOTE: this should be loaded via external api requests in most apps
  private getDataFor1Q():any[] {
    return [
      {
        "time": "0:01",
        "player": 2,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "0:02",
        "player": 14,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "0:07",
        "player": 22,
        "team": 2,
        "attempt": "ORB"
      }, {
        "time": "0:08",
        "player": 34,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "0:24",
        "player": 14,
        "team": 2,
        "attempt": "ORB"
      }, {
        "time": "0:25",
        "player": 34,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "0:37",
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "0:39",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "0:46",
        "player": 34,
        "team": 2,
        "attempt": "AST"
      }, {
        "time": "0:47",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "1:01",
        "player": 35,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "1:03",
        "player": 10,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {
        "time": "1:20",
        "player": 34,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "1:31",
        "player": 2,
        "team": 1,
        "attempt": "FT",
        "result": "success"
      }, {
        "time": "1:31",
        "player": 2,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {
        "time": "1:31",
        "player": 5,
        "team": 2,
        "attempt": "change",
        "result": 22
      }, {
        "time": "1:31",
        "player": 2,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "1:31",
        "player": 5,
        "team": 2,
        "attempt": "FT"
      }, {
        "time": "1:40",
        "player": 2,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "1:41",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "2:02",
        "player": 10,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "2:03",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "2:20",
        "player": 5,
        "team": 2,
        "attempt": "AST"
      }, {
        "time": "2:21",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "2:36",
        "player": 10,
        "team": 1,
        "attempt": "TOV"
      }, {
        "time": "2:41",
        "player": 34,
        "team": 2,
        "attempt": "AST"
      }, {
        "time": "2:43",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "2:52",
        "player": 5,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "2:53",
        "player": 10,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "3:07",
        "player": 22,
        "attempt": "change",
        "team": 2,
        "result": 34
      }, {
        "time": "3:07",
        "player": 33,
        "attempt": "change",
        "team": 1,
        "result": 35
      }, {
        "time": "3:07",
        "player": 24,
        "team": 1,
        "result": 20
      }, {
        "time": "3:07",
        "player": 22,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "3:10",
        "player": 22,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "3:11",
        "player": 16,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "3:19",
        "player": 33,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "3:21",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "3:32",
        "player": 10,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "3:33",
        "player": 24,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "3:37",
        "player": 31,
        "team": 2,
        "attempt": "change",
        "change": 14
      }, {
        "time": "3:37",
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "3:37",
        "player": 5,
        "team": 2,
        "attempt": "BLK"
      }, {
        "time": "3:37",
        "player": 10,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "3:40",
        "player": 2,
        "team": 1,
        "attempt": "STL"
      }, {
        "time": "3:41",
        "player": 31,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "3:50",
        "player": 33,
        "team": 1,
        "attempt": "TOV"
      }, {
        "time": "3:51",
        "player": 33,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "3:53",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "3:53",
        "player": 10,
        "team": 2,
        "attempt": "ORB"
      }, {
        "time": "3:55",
        "player": 31,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {
        "time": "3:55",
        "player": 31,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {
        "time": "3:55",
        "player": 31,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "4:08",
        "player": 15,
        "attempt": "change",
        "team": 1,
        "result": 10
      }, {
        "time": "4:08",
        "player": 15,
        "team": 1,
        "attempt": "FT",
        "result": "success"
      }, {
        "time": "4:08",
        "player": 15,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {
        "time": "4:08",
        "player": 32,
        "team": 2,
        "attempt": "change",
        "result": 10
      }, {
        "time": "4:08",
        "player": 8,
        "team": 2,
        "attempt": "change",
        "result": 6
      }, {
        "time": "4:08",
        "player": 13,
        "team": 1,
        "attempt": "change",
        "result": 16
      }, {
        "time": "4:08",
        "player": 15,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "4:08",
        "player": 15,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "4:10",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "4:14",
        "player": 15,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "4:16",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "4:37",
        "player": 32,
        "team": 2,
        "attempt": "AST"
      }, {
        "time": "4:38",
        "player": 22,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {
        "time": "4:51",
        "player": 8,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "4:52",
        "player": 33,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "5:07",
        "player": 5,
        "team": 2,
        "attempt": "AST"
      }, {
        "time": "5:09",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "5:21",
        "player": 2,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "5:22",
        "player": 24,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {
        "time": "5:34",
        "player": 24,
        "team": 1,
        "attempt": "STL"
      }, {
        "time": "5:34",
        "player": 8,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "5:44",
        "player": 8,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "5:45",
        "player": 24,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "5:48",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "5:55",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "6:00",
        "player": 31,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "6:01",
        "player": 8,
        "team": 2,
        "attempt": "BLK"
      }, {
        "time": "6:02",
        "player": 24,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "6:06",
        "player": 24,
        "team": 1,
        "attempt": "STL"
      }, {
        "time": "6:08",
        "player": 32,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "6:22",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "6:31",
        "player": 33,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "6:32",
        "player": 22,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "6:42",
        "player": 34,
        "team": 2,
        "attempt": "change",
        "result": 32
      }, {
        "time": "6:42",
        "player": 14,
        "team": 2,
        "attempt": "change",
        "result": 5
      }, {
        "time": "6:42",
        "attempt": "TO",
        "team": 2
      }, {
        "time": "6:42",
        "player": 24,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "6:42",
        "player": 13,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {
        "time": "6:42",
        "player": 24,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "6:48",
        "player": 15,
        "team": 1,
        "attempt": "BLK"
      }, {
        "time": "6:50",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "7:05",
        "player": 13,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "7:06",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "7:30",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "7:46",
        "player": 2,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "7:47",
        "player": 33,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {
        "time": "7:54",
        "player": 33,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "7:55",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "8:13",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "8:17",
        "player": 33,
        "team": 1,
        "attempt": "STL"
      }, {
        "time": "8:18",
        "player": 14,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "8:36",
        "player": 24,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "8:37",
        "player": 13,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "8:49",
        "player": 14,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "8:56",
        "player": 22,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "8:57",
        "player": 24,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "9:13",
        "player": 34,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {
        "time": "9:13",
        "player": 34,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {
        "time": "9:13",
        "player": 34,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "9:40",
        "player": 33,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }
    ];
  }

  // Data for the second quarter
  // NOTE: this should be loaded via external api requests in most apps
  private getDataFor2Q():any[] {
    return [
      {
        "time": "0:02",
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "0:04",
        "player": 14,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "0:27",
        "player": 31,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "0:28",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "0:39",
        "player": 22,
        "team": 2,
        "attempt": "change",
        "result": 34
      }, {
        "time": "0:39",
        "player": 13,
        "team": 1,
        "attempt": "change",
        "result": 16
      }, {
        "time": "0:39",
        "team": 1,
        "attempt": "TO"
      }, {
        "time": "0:39",
        "player": 10,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "0:39",
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "0:40",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "0:58",
        "player": 8,
        "team": 2,
        "attempt": "change",
        "result": 10
      }, {
        "time": "0:58",
        "player": 22,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "1:11",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "1:11",
        "player": 15,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "1:13",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "1:25",
        "player": 24,
        "attempt": "change",
        "result": 6,
        "team": 2
      }, {
        "time": "1:25",
        "team": 2,
        "attempt": "TO"
      }, {
        "time": "1:25",
        "player": 10,
        "team": 1,
        "attempt": "STL"
      }, {
        "time": "1:25",
        "player": 8,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "1:45",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "1:45",
        "player": 15,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "1:47",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "2:03",
        "player": 8,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "2:17",
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "2:24",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "2:28",
        "player": 32,
        "team": 2,
        "attempt": "change",
        "result": 31
      }, {
        "time": "2:28",
        "player": 13,
        "team": 2,
        "attempt": "change",
        "result": 14
      }, {
        "time": "2:28",
        "player": 15,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "2:32",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "2:32",
        "player": 22,
        "team": 2,
        "attempt": "ORB"
      }, {
        "time": "2:35",
        "player": 8,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "3:03",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "3:09",
        "player": 13,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "3:11",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "3:13",
        "player": 8,
        "team": 2,
        "attempt": "ORB"
      }, {
        "time": "3:16",
        "player": 13,
        "team": 1,
        "attempt": "BLK"
      }, {
        "time": "3:17",
        "player": 13,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "3:35",
        "player": 2,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "3:36",
        "player": 10,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "3:46",
        "player": 24,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "3:48",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "4:05",
        "player": 10,
        "team": 2,
        "attempt": "change",
        "result": 24
      }, {
        "time": "4:05",
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "4:09",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "4:13",
        "player": 15,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "4:14",
        "player": 13,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "4:24",
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "4:28",
        "player": 13,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "4:32",
        "player": 13,
        "team": 1,
        "attempt": "TOV"
      }, {
        "time": "4:34",
        "player": 13,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "4:36",
        "player": 10,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "4:51",
        "player": 22,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "4:58",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "4:58",
        "player": 15,
        "team": 1,
        "attempt": "ORB"
      }, {
        "time": "5:00",
        "player": 10,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "5:05",
        "player": 15,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "5:25",
        "player": 13,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "5:29",
        "player": 32,
        "team": 2,
        "attempt": "STL"
      }, {
        "time": "5:31",
        "player": 13,
        "team": 1,
        "attempt": "TOV"
      }, {
        "time": "5:47",
        "player": 2,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "5:47",
        "player": 22,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {
        "time": "5:47",
        "player": 22,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {
        "time": "5:47",
        "player": 22,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "5:47",
        "player": 22,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "5:48",
        "player": 24,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "6:01",
        "player": 32,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "6:01",
        "player": 22,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "6:10",
        "player": 31,
        "team": 2,
        "attempt": "change",
        "result": 8
      }, {
        "time": "6:10",
        "player": 32,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "6:23",
        "player": 15,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "6:24",
        "player": 10,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {
        "time": "6:36",
        "player": 10,
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "6:37",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "6:45",
        "player": 34,
        "team": 2,
        "attempt": "change",
        "result": 22
      }, {
        "time": "6:45",
        "player": 35,
        "team": 1,
        "attempt": "change",
        "result": 10
      }, {
        "time": "6:45",
        "player": 33,
        "team": 1,
        "attempt": "change",
        "result": 2
      }, {
        "time": "6:45",
        "player": 34,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "6:53",
        "player": 13,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "6:58",
        "player": 13,
        "team": 1,
        "attempt": "STL"
      }, {
        "time": "6:59",
        "player": 34,
        "team": 2,
        "attempt": "TOV"
      }, {
        "time": "7:08",
        "player": 14,
        "team": 2,
        "attempt": "change",
        "result": 32
      }, {
        "time": "7:08",
        "player": 16,
        "team": 1,
        "attempt": "change",
        "result": 13
      }, {
        "time": "7:08",
        "player": 34,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "7:08",
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "7:09",
        "player": 24,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {
        "time": "7:19",
        "player": 13,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "7:37",
        "player": 24,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "7:43",
        "player": 35,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "7:52",
        "player": 10,
        "team": 1,
        "attempt": "change",
        "result": 15
      }, {
        "time": "7:59",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "8:13",
        "player": 34,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "8:14",
        "player": 16,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "8:36",
        "player": 7,
        "attempt": "change",
        "result": 24,
        "team": 1
      }, {
        "time": "8:36",
        "player": 6,
        "team": 2,
        "attempt": "change",
        "result": 13
      }, {
        "time": "8:36",
        "team": 1,
        "attempt": "TO"
      }, {
        "time": "8:36",
        "player": 34,
        "team": 2,
        "attempt": "AST"
      }, {
        "time": "8:36",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "8:47",
        "player": 10,
        "team": 2,
        "attempt": "DRB"
      }, {
        "time": "8:48",
        "player": 35,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "9:05",
        "team": 1,
        "attempt": "DRB"
      }, {
        "time": "9:06",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "9:11",
        "player": 34,
        "team": 2,
        "attempt": "STL"
      }, {
        "time": "9:12",
        "player": 33,
        "team": 1,
        "attempt": "TOV"
      }, {
        "time": "9:30",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "9:40",
        "player": 33,
        "team": 1,
        "attempt": "TOV"
      }, {
        "time": "9:50",
        "player": 34,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "10:00",
        "player": 22,
        "team": 2,
        "attempt": "change",
        "result": 31
      }, {
        "time": "10:00",
        "player": 20,
        "team": 1,
        "attempt": "change",
        "result": 33
      }, {
        "time": "10:00",
        "player": 2,
        "team": 1,
        "attempt": "change",
        "result": 7
      }
    ];
  }

  // Data for the third quarter
  // NOTE: this should be loaded via external api requests in most apps
  private getDataFor3Q():any[] {
    return [
      {
        "time": "0:03",
        "player": 24,
        "team": 1,
        "attempt": "AST"
      }, {
        "time": "0:04",
        "player": 20,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {
        "time": "0:06",
        "player": 35,
        "team": 1,
        "attempt": "change",
        "result": 24
      }, {
        "time": "0:06",
        "player": 32,
        "team": 2,
        "attempt": "change",
        "result": 14
      }, {
        "time": "0:06",
        "team": 1,
        "attempt": "ORB"
      }, {

        "time": "0:07",
        "player": 10,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "0:36",
        "player": 24,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "0:56",
        "player": 13,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "0:57",
        "player": 16,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "1:02",
        "player": 35,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "1:03",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "1:20",
        "player": 34,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "1:21",
        "player": 13,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "1:29",
        "player": 13,
        "team": 2,
        "attempt": "change",
        "result": 24
      }, {

        "time": "1:29",
        "player": 10,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "1:37",
        "player": 13,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "1:52",
        "player": 31,
        "team": 2,
        "attempt": "PF"
      }, {

        "time": "1:53",
        "player": 8,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "1:53",
        "player": 10,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "2:00",
        "player": 20,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "2:01",
        "player": 34,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "2:08",
        "player": 34,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "2:25",
        "player": 24,
        "team": 1,
        "attempt": "change",
        "result": 13
      }, {

        "time": "2:25",
        "player": 24,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "2:36",
        "player": 20,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "2:36",
        "player": 13,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "2:53",
        "player": 14,
        "team": 2,
        "attempt": "change",
        "result": 31
      }, {

        "time": "2:53",
        "player": 6,
        "team": 2,
        "attempt": "change",
        "result": 13

      }, {
        "time": "2:53",
        "team": 2,
        "attempt": "TO"
      }, {

        "time": "2:53",
        "player": 24,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "2:53",
        "player": 16,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "2:58",
        "player": 35,
        "team": 1,
        "attempt": "STL"
      }, {

        "time": "2:59",
        "player": 32,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "3:10",
        "player": 16,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "3:31",
        "player": 34,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "3:42",
        "player": 8,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "3:44",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "4:04",
        "player": 24,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "4:05",
        "player": 35,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "4:26",
        "player": 6,
        "team": 2,
        "attempt": "AST"
      }, {

        "time": "4:26",
        "player": 8,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "4:32",
        "player": 31,
        "team": 2,
        "attempt": "change",
        "result": 32
      }, {

        "time": "4:32",
        "player": 10,
        "team": 2,
        "attempt": "change",
        "result": 8
      }, {

        "time": "4:49",
        "player": 24,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "4:50",
        "player": 10,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "5:07",
        "player": 20,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "5:08",
        "player": 34,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "5:25",
        "player": 24,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "5:45",
        "player": 15,
        "team": 1,
        "attempt": "change",
        "result": 20
      }, {

        "time": "5:45",
        "player": 2,
        "team": 1,
        "attempt": "change",
        "result": 16
      }, {

        "time": "5:45",
        "player": 5,
        "team": 2,
        "attempt": "change",
        "result": 34
      }, {

        "time": "5:45",
        "player": 10,
        "team": 1,
        "attempt": "PF"
      }, {

        "time": "5:47",
        "player": 24,
        "team": 1,
        "attempt": "STL"
      }, {

        "time": "5:48",
        "player": 6,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "5:52",
        "player": 14,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "5:53",
        "player": 31,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "6:15",
        "player": 31,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "6:16",
        "player": 24,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "6:18",
        "player": 10,
        "team": 1,
        "attempt": "PF"
      }, {

        "time": "6:18",
        "player": 10,
        "team": 1,
        "attempt": "ORB"
      }, {

        "time": "6:19",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "6:32",
        "player": 5,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "6:48",
        "player": 10,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "6:52",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "6:53",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "6:59",
        "player": 5,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "7:00",
        "player": 5,
        "team": 2,
        "attempt": "BLK"
      }, {

        "time": "7:01",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "7:14",
        "player": 5,
        "team": 2,
        "attempt": "AST"
      }, {

        "time": "7:15",
        "player": 31,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "7:20",
        "player": 5,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "7:20",
        "player": 14,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "7:29",
        "player": 5,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "7:30",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "7:50",
        "player": 31,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "7:50",
        "player": 31,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "7:50",
        "player": 31,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "7:51",
        "player": 5,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "7:52",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "7:57",
        "player": 10,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "7:58",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "8:09",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "8:10",
        "player": 5,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "8:29",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "8:35",
        "player": 2,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "8:36",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "8:49",
        "player": 10,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "8:50",
        "player": 2,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "8:55",
        "player": 10,
        "team": 1,
        "attempt": "ORB"
      }, {

        "time": "8:56",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "9:02",
        "player": 15,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "9:17",
        "player": 5,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "9:39",
        "player": 2,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "9:40",
        "player": 10,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "9:47",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "9:48",
        "player": 14,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "10:00",
        "player": 34,
        "team": 2,
        "attempt": "change",
        "result": 5
      }, {

        "time": "10:00",
        "player": 16,
        "team": 1,
        "attempt": "change",
        "result": 35
      }
    ];
  }

  // Data for the fourth quarter
  // NOTE: this should be loaded via external api requests in most apps
  private getDataFor4Q():any[] {
    return [
      {
        "time": "0:04",
        "player": 15,
        "team": 1,
        "attempt": "STL"
      }, {

        "time": "0:05",
        "player": 14,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "0:11",
        "player": 34,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "0:12",
        "player": 15,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "0:12",
        "player": 15,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "0:12",
        "player": 15,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "0:13",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "0:14",
        "player": 31,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {
        "time": "0:16",
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "0:16",
        "player": 33,
        "team": 1,
        "attempt": "BLK"
      }, {

        "time": "0:16",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "0:16",
        "player": 22,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "0:17",
        "player": 15,
        "team": 1,
        "attempt": "BLK"
      }, {

        "time": "0:18",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "0:24",
        "team": 2,
        "attempt": "TO"
      }, {

        "time": "0:24",
        "player": 33,
        "team": 1,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "0:24",
        "player": 33,
        "team": 1,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "0:24",
        "player": 33,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "0:27",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "0:29",
        "player": 31,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "0:40",
        "player": 34,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "0:43",
        "player": 13,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "0:57",
        "player": 34,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "1:08",
        "player": 10,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "1:09",
        "player": 15,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "1:22",
        "team": 1,
        "attempt": "ORB"
      }, {

        "time": "1:26",
        "player": 24,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "1:32",
        "team": 1,
        "attempt": "TO"
      }, {

        "time": "1:32",
        "player": 34,
        "team": 2,
        "attempt": "AST"
      }, {

        "time": "1:32",
        "player": 31,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "1:38",
        "player": 6,
        "team": 2,
        "attempt": "change",
        "result": 31
      }, {

        "time": "1:51",
        "player": 10,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "1:54",
        "player": 13,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "2:09",
        "player": 34,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "2:27",
        "player": 33,
        "team": 1,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "2:27",
        "player": 33,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "2:27",
        "player": 33,
        "team": 1,
        "attempt": "PF"
      }, {
        "time": "2:41",
        "player": 34,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "2:42",
        "player": 34,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "2:43",
        "player": 14,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "2:43",
        "player": 14,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "2:43",
        "player": 14,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "2:43",
        "player": 14,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "2:45",
        "player": 22,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "3:01",
        "player": 34,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "3:03",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "3:18",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "3:22",
        "player": 22,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "3:22",
        "player": 22,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "3:22",
        "player": 5,
        "team": 2,
        "attempt": "change",
        "result": 34
      }, {

        "time": "3:22",
        "player": 22,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "3:34",
        "player": 24,
        "team": 1,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "3:50",
        "player": 10,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "4:03",
        "player": 14,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {
        "time": "4:03",
        "player": 13,
        "team": 1,
        "attempt": "TF"
      }, {
        "time": "4:10",
        "player": 10,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "4:11",
        "player": 14,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "4:24",
        "player": 33,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "4:29",
        "player": 33,
        "team": 1,
        "attempt": "ORB"
      }, {

        "time": "4:30",
        "player": 13,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "4:47",
        "player": 14,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "4:51",
        "player": 22,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "4:52",
        "player": 10,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "4:58",
        "player": 5,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "5:00",
        "player": 2,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "5:07",
        "player": 15,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "5:08",
        "player": 13,
        "team": 1,
        "attempt": "BLK"
      }, {

        "time": "5:09",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "5:22",
        "player": 22,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "5:23",
        "player": 33,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "5:29",
        "player": 24,
        "team": 1,
        "attempt": "PF"
      }, {

        "time": "5:37",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "5:42",
        "player": 5,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "5:43",
        "player": 2,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "5:53",
        "team": 1,
        "attempt": "TO"
      }, {

        "time": "5:53",
        "player": 5,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "5:53",
        "player": 5,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "5:54",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "5:59",
        "player": 5,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "6:00",
        "player": 13,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "6:09",
        "player": 16,
        "team": 1,
        "attempt": "change",
        "result": 13
      }, {

        "time": "6:09",
        "player": 5,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "6:09",
        "player": 5,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "6:09",
        "player": 5,
        "team": 2,
        "attempt": "PF"
      }, {
        "time": "6:14",
        "player": 22,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "6:15",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "6:30",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "6:39",
        "player": 31,
        "team": 2,
        "attempt": "change",
        "result": 10
      }, {

        "time": "6:39",
        "team": 2,
        "attempt": "TO"
      }, {

        "time": "6:39",
        "player": 2,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "6:44",
        "player": 2,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "6:46",
        "player": 22,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "6:46",
        "player": 22,
        "team": 2,
        "attempt": "ORB"
      }, {

        "time": "6:48",
        "player": 6,
        "team": 2,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "7:04",
        "player": 2,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "7:04",
        "player": 33,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "7:12",
        "player": 16,
        "team": 1,
        "attempt": "ORB"
      }, {

        "time": "7:13",
        "player": 31,
        "team": 2,
        "attempt": "BLK"
      }, {

        "time": "7:15",
        "player": 16,
        "team": 1,
        "attempt": "2PT",
        "result": "failure"
      }, {

        "time": "7:24",
        "player": 10,
        "team": 1,
        "attempt": "change",
        "result": 15
      }, {

        "time": "7:24",
        "player": 10,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "7:24",
        "player": 10,
        "team": 1,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "7:24",
        "player": 13,
        "team": 1,
        "attempt": "change",
        "result": 24
      }, {

        "time": "7:24",
        "player": 10,
        "team": 1,
        "attempt": "PF"
      }, {

        "time": "7:25",
        "player": 10,
        "team": 1,
        "attempt": "STL"
      }, {

        "time": "7:25",
        "player": 31,
        "team": 2,
        "attempt": "TOV"
      }, {

        "time": "7:40",
        "player": 6,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "7:41",
        "player": 13,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "8:04",
        "player": 5,
        "team": 2,
        "attempt": "FT",
        "result": "success"
      }, {

        "time": "8:04",
        "player": 34,
        "team": 2,
        "attempt": "change",
        "result": 22
      }, {
        "time": "8:04",
        "player": 5,
        "team": 2,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "8:08",
        "player": 34,
        "team": 2,
        "attempt": "STL"
      }, {

        "time": "8:09",
        "player": 2,
        "team": 1,
        "attempt": "TOV"
      }, {

        "time": "8:24",
        "player": 33,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "8:25",
        "player": 5,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "8:25",
        "player": 5,
        "team": 2,
        "attempt": "FT",
        "result": "failure"
      }, {

        "time": "8:25",
        "player": 5,
        "team": 2,
        "attempt": "PF"
      }, {

        "time": "8:35",
        "player": 16,
        "team": 1,
        "attempt": "AST"
      }, {

        "time": "8:37",
        "player": 33,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "8:51",
        "player": 5,
        "team": 2,
        "attempt": "AST"
      }, {

        "time": "8:53",
        "player": 6,
        "team": 2,
        "attempt": "3PT",
        "result": "success"
      }, {

        "time": "9:18",
        "player": 13,
        "team": 1,
        "attempt": "2PT",
        "result": "success"
      }, {

        "time": "9:29",
        "player": 13,
        "team": 1,
        "attempt": "DRB"
      }, {

        "time": "9:30",
        "player": 14,
        "team": 2,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "9:43",
        "player": 5,
        "team": 2,
        "attempt": "DRB"
      }, {

        "time": "9:44",
        "player": 13,
        "team": 1,
        "attempt": "3PT",
        "result": "failure"
      }, {

        "time": "9:53",
        "player": 16,
        "team": 1,
        "attempt": "PF"
      }, {

        "time": "10:00",
        "player": 24,
      "team": 2,
        "attempt": "change",
        "result": 6
      }, {

        "time": "10:00",
        "player": 8,
        "team": 2,
        "attempt": "change",
        "result": 5
      }, {

        "time": "10:00",
        "player": 24,
        "team": 1,
        "attempt": "change",
        "result": 33
      }, {

        "time": "10:00",
        "player": 20,
        "team": 1,
        "attempt": "change",
        "result": 2
      }
    ];
  }

}
