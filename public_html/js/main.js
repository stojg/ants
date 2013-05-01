require.config({
	paths: {
		pulse: 'libs/pulse/bin/pulse'
	},
	shim: {
		'pulse': {
			exports: 'pulse'
		}
	}
});

require(['app'], function(App) {
	App.init();
});

