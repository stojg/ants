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
	}
});

require(['app'], function(App) {
	App.init();
});

