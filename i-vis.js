window.onload = function () {

	var functionsNewton = [
		interpolate('Newton', [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y:3}, {x:4, y:4}, {x:5, y:5}]), // linear [1,5]
		interpolate('Newton', [{x: -2, y: 4}, {x: -1, y: 1}, {x: 0, y:0}, {x: 1, y:1}, {x:2, y:4}]), // square [-2,2]
		interpolate('Newton', [{x: -2, y: -8}, {x: -1, y: -1}, {x: 0, y:0}, {x: 1, y:1}, {x:2, y:8}]), // cube [-2, 2]
		interpolate('Newton', [
							{x: -2, y: 4}, 
							{x: -1.5, y: 2.25},
							{x: -1, y: 1}, 
							{x: -0.5, y: .25}, 
							{x: 0, y:0}, 
							{x: 0.5, y: .25}, 
							{x: 1, y:1}, 
							{x: 1.5, y: 2.25}, 
							{x:2, y:4}
							]), // a bit smoother square [-2, 2]		
		interpolate('Newton', [
							{x: -2, y: -8}, 
							{x: -1.5, y: -3.375},
							{x: -1, y: -1}, 
							{x: -0.5, y: -.125}, 
							{x: 0, y:0}, 
							{x: 0.5, y: .125}, 
							{x: 1, y:1}, 
							{x: 1.5, y: 3.375}, 
							{x:2, y:8}
							]) // a bit smoother cube [-2, 2]
	],
		counter = 0,
		palette = new Rickshaw.Color.Palette();

	functionsNewton.forEach(function (fn) {
		var data = [];

		for (var i = fn.interpolationStartX; i <= fn.interpolationEndX; i += 0.5) {
			data.push({x: i, y: fn(i)});
		}

		var div = document.createElement('div');
		div.setAttribute('id', 'graph' + ++counter);
		div.style.float = 'left';
		document.body.appendChild(div);

		var graph = new Rickshaw.Graph({
			min: 'auto',
			element: div,
			height: 250,
			width: 400,
			renderer: 'line',
			series: [
				{
				data : data,
				color : palette.color()
				}
			]
		});

		new Rickshaw.Graph.Axis.X({ graph : graph });
		new Rickshaw.Graph.Axis.Y({ graph : graph });

		graph.render();
	})
}