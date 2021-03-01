class TeamData {}

TeamData.randomize = false; // default value
TeamData.timeConfig = {
	'0': [ 0, 0, 0, 0, 0 ],
	'20': [ 20, 15, 10, 5, 0 ],
	'30': [ 30, 23, 16, 9, 0 ],
	'40': [ 40, 30, 20, 10, 0 ]
};

TeamData.timeDivision = [];

TeamData.caught = [ 'a_caught1', 'a_caught2', 'a_caught3' ];
TeamData.bowled = [ 'a_bowled1', 'a_bowled2' ];

TeamData.strikeName = [
	{
		vo: [ 'a_six5', 'a_six1', 'a_six2', 'a_six3', 'a_six4', 'a_six1' ],
		cheers: 'cheers6',
		txt: 'Strike for Six',
		label: 'sixer',
		value: 6
	},
	{
		vo: [ 'a_six5', 'a_six1', 'a_six2', 'a_six3', 'a_six4', 'a_six1' ],
		cheers: 'cheers6',
		txt: 'Strike for Six',
		label: 'sixer2',
		value: 6
	},
	{
		vo: [ 'a_four5', 'a_four1', 'a_four2', 'a_four3', 'a_four4', 'a_four6' ],
		cheers: 'cheers4',
		txt: 'Strike for Four',
		label: 'boundary',
		value: 4
	},
	{
		vo: [ 'a_two4', 'a_two1', 'a_two2', 'a_two5', 'a_two6', 'a_two3' ],
		cheers: 'cheers1',
		txt: 'Strike for Two',
		label: 'doubles',
		value: 2
	},
	{
		vo: [ 'a_one5', 'a_one1', 'a_one2', 'a_one3', 'a_one4', 'a_one4' ],
		cheers: 'cheers1',
		txt: 'Strike for One',
		label: 'singles',
		value: 1
	},
	{
		vo: [ 'NoRun', 'NoRun', 'NoRun', 'NoRun', 'NoRun', 'NoRun' ],
		cheers: 'stadium_noise',
		txt: 'Strike for Zero',
		label: 'dot',
		value: 0
	}
];

export default TeamData;
