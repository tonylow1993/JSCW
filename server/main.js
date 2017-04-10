import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http'
import { FlowRouter } from 'meteor/kadira:flow-router'
import xml2js from 'xml2js'
import utf8 from 'utf8'
import fs from 'fs'

Meteor.startup(() => {
	
	const parser = new xml2js.Parser({
		async: false,
	});

	// Global API configuration
	var Api = new Restivus({
		useDefaultAuth: true,
		prettyJson: true
	});

	const teams_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?querytype=TEALST&submit1=Get+XML";
	const matches_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?querytype=MATLST&submit1=Get+XML";
	const had_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?PoolType=HAD&querytype=ODDS&submit1=Get+XML";
	const crs_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?PoolType=CRS&querytype=ODDS&submit1=Get+XML";
	const ttg_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?PoolType=TTG&querytype=ODDS&submit1=Get+XML";
	const hha_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?PoolType=HHA&querytype=ODDS&submit1=Get+XML";
	const hdc_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?PoolType=HDC&querytype=ODDS&submit1=Get+XML";
	const hil_url = "http://bet.hkjc.com/sbmmfclient/sbmmfclient.asp?PoolType=HIL&querytype=ODDS&submit1=Get+XML";

	const Teams = new Mongo.Collection('teams');
	const Matches = new Mongo.Collection('matches');
	//Matches.remove({});
	/*const teamsXML = HTTP.call( 'GET', teams_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	parser.parseString(teamsXML.content, (err, json) => {
		teams = json;
		teams.TEAM_LIST.TEAM.map(team => {
			Teams.insert(
				{
					ID: team.$.CODE.toString(),
					SHORT_NAME: team.SHORT_NAME.toString(),
					E_NAME: team.E_NAME.toString(),
					C_NAME: team.C_NAME.toString(),
					SC_NAME: team.SC_NAME.toString(),
					COUNTRY_CODE: team.COUNTRY_CODE.toString()
				}
			);
		})
	})*/

	const matchesXML = HTTP.call( 'GET', matches_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	const hadXML = HTTP.call( 'GET', had_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	const crsXML = HTTP.call( 'GET', crs_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	const ttgXML = HTTP.call( 'GET', ttg_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	const hhaXML = HTTP.call( 'GET', hha_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});
	
	const hilXML = HTTP.call( 'GET', hil_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	const hdcXML = HTTP.call( 'GET', hdc_url, {
		"npmRequestOptions" : {gzip : true, encoding: 'utf8'}
	});

	parser.parseString(matchesXML.content, (err, json) => {
		json.MATCH_LIST.COUPON.map(coupon => {
			coupon.MATCH.map(match => {
				if (match.$.CLOSE == '0' && match.$.STATUS == '1'){
					Matches.update(
						{ "id": match.$.ID },
						{
							"id": match.$.ID,
							"no": match.$.DAY + " " + match.$.NUM,
							"home": Teams.findOne({"ID": match.HOME_TEAM.toString()}).E_NAME,
							"away": Teams.findOne({"ID": match.AWAY_TEAM.toString()}).E_NAME,
							"expectedStopSellingTime": match.POOL_CLOSE_TIME.toString().substring(0,2) + ":" + match.POOL_CLOSE_TIME.toString().substring(2,2) + ":" + match.POOL_CLOSE_TIME.toString().substring (4, 2) + " " + match.POOL_CLOSE_DATE.toString(),
							"nts": match.$.NTS,
							"neutral": match.VENUE[0].$.NEUTRAL.toString()
						},
						{
							upsert: true
						}
					);
				}
			})
		})
	})

	parser.parseString(hadXML.content, (err, json) => {
		json.ODDS.MATCH.map(match => {
			Matches.update(
				{ "id": match.$.ID },
				{
					$set: { "hadOddsComb": match.ODDS_COMB[0]._.toString() }
				}
			);
		})
	})

	parser.parseString(crsXML.content, (err, json) => {
		json.ODDS.MATCH.map(match => {
			Matches.update(
				{ "id": match.$.ID },
				{
					$set: { "crsOddsComb": match.ODDS_COMB[0]._.toString() }
				}
			);
		})
	})

	parser.parseString(ttgXML.content, (err, json) => {
		json.ODDS.MATCH.map(match => {
			Matches.update(
				{ "id": match.$.ID },
				{
					$set: { "ttgOddsComb": match.ODDS_COMB[0]._.toString() }
				}
			);
		})
	})

	parser.parseString(hhaXML.content, (err, json) => {
		json.ODDS.MATCH.map(match => {
			Matches.update(
				{ "id": match.$.ID },
				{
					$set: { "hhaOddsComb": match.ODDS_COMB[0]._.toString() }
				}
			);
		})
	})

	parser.parseString(hilXML.content, (err, json) => {
		json.ODDS.MATCH.map(match => {
			match.ODDS_COMB.map(line => {
				Matches.update(
					{ "id": match.$.ID },
					{
						$addToSet: { "hilOddsComb": line._.toString() }
					}
				);
			})
		})
	})

	parser.parseString(hdcXML.content, (err, json) => {
		json.ODDS.MATCH.map(match => {
			match.ODDS_COMB.map(line => {
				Matches.update(
					{ "id": match.$.ID },
					{
						$addToSet: { "hdcOddsComb": line._.toString() }
					}
				);
			})
		})
	})

	// Maps to: /api/matches
	Api.addRoute('matches', {}, {
		get: function () {
			const matches = [];
			Matches.find().map(match => {
				matches.push(match);
			})
			return matches;
		},
	});

	// Maps to: /api/match/:id
	Api.addRoute('match/:id', {}, {
		get: function () {
			const id = this.urlParams.id;
			const match = Matches.findOne({"id": id});

			let matchOdds = {
				id: match.id,
				no: match.no,
				home: match.home,
				away: match.away,
				expectedStopSellingTime: match.expectedStopSellingTime,
				nts: match.nts,
				neutral: match.neutral,
				"pools":{  
					"nonLinePools":{  
						"HAD":{  
							"H":null,
							"A":null,
							"D":null
						},
						"CRS":{  
							"0100":null,
							"0200":null,
							"0201":null,
							"0300":null,
							"0301":null,
							"0302":null,
							"0400":null,
							"0401":null,
							"0402":null,
							"0500":null,
							"0501":null,
							"0502":null,
							"0000":null,
							"0101":null,
							"0202":null,
							"0303":null,
							"0001":null,
							"0002":null,
							"0102":null,
							"0003":null,
							"0103":null,
							"0203":null,
							"0004":null,
							"0104":null,
							"0204":null,
							"0005":null,
							"0105":null,
							"0205":null,
							"-1-H":null,
							"-1-A":null,
							"-1-D":null
						},
						"TTG":{  
							"0":null,
							"1":null,
							"2":null,
							"3":null,
							"4":null,
							"5":null,
							"6":null,
							"-7":null
						}
					},
					"linePools":{  
						"HHA":{  
							
						},
						"HDC":{  
							
						},
						"HIL":{  
							
						}
					}
				}		
			}

			match.hadOddsComb.split(",").map(hadComb => {
				const had = hadComb.split("@");
				matchOdds.pools.nonLinePools.HAD[had[0][3]] = had[1];
			});

			match.crsOddsComb.split(",").map(crsComb => {
				const crs = crsComb.split("@");
				matchOdds.pools.nonLinePools.CRS[crs[0][3]+crs[0][4]+crs[0][6]+crs[0][7]] = crs[1];
			});

			match.ttgOddsComb.split(",").map(ttgComb => {
				const ttg = ttgComb.split("@");
				matchOdds.pools.nonLinePools.TTG[ttg[0][4]] = ttg[1];
				if (ttg[0][3] == "-"){
					matchOdds.pools.nonLinePools.TTG["-7"] = ttg[1];
				}
			});

			match.hhaOddsComb.split(",").map(hhaComb => {
				const hha = hhaComb.split("@");
				matchOdds.pools.linePools.HHA[hha[0].substring(3,5)] = (matchOdds.pools.linePools.HHA[hha[0].substring(3,5)] === undefined) ? {} : matchOdds.pools.linePools.HHA[hha[0].substring(3,5)];
				matchOdds.pools.linePools.HHA[hha[0].substring(3,5)][hha[0][6]] = hha[1];
			});

			match.hilOddsComb.map(hilLines => {
					hilLines.split(",").map(comb =>{
						const hil = comb.split("@");
						const lineStr = hil[0].substring(3,10).replace(":", "/");
						matchOdds.pools.linePools.HIL[lineStr] = (matchOdds.pools.linePools.HIL[lineStr] === undefined) ? {} : matchOdds.pools.linePools.HIL[lineStr];
						matchOdds.pools.linePools.HIL[lineStr][hil[0][11]] = hil[1];
					})
			});

			match.hdcOddsComb.map(hdcLines => {
					hdcLines.split(",").map(comb =>{
						const hdc = comb.split("@");
						const lineStr = hdc[0].substring(3,12).replace(":", "/");
						matchOdds.pools.linePools.HDC[lineStr] = (matchOdds.pools.linePools.HDC[lineStr] === undefined) ? {} : matchOdds.pools.linePools.HDC[lineStr];
						matchOdds.pools.linePools.HDC[lineStr][hdc[0][13]] = hdc[1];
					})
			});

			return matchOdds;
		},
	});

});
