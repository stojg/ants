require.config({
	paths: {
		pulse: 'libs/pulse/bin/pulse',
		vector: 'libs/sylvester.src',
		kdTree: 'libs/kd-tree/kdTree'
	},
	shim: {
		'pulse': {
			exports: 'pulse'
		},
		'vector': {
			exports: 'vector'
		},
		'kdTree': {
			exports: 'kdTree'
		}
	},
	urlArgs: "version=0.3.2"
});

require(['app'], function(App) {
	App.init();
});

