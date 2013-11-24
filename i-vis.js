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
							]), // a bit smoother cube [-2, 2]
		interpolate('Newton', [
							{x: -2 * Math.PI, y: 0}, 
							{x: -7 * Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: -3 * Math.PI / 2, y: 1},
							{x: -5 * Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: - Math.PI, y: 0},
							{x: -3 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: - Math.PI / 2, y: -1},
							{x: - Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: 0, y: 0},
							{x: Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: Math.PI / 2, y: 1},
							{x: 3 * Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: Math.PI, y: 0},
							{x: 5 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: 3 * Math.PI / 2, y: -1},
							{x: 7 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: 2 * Math.PI, y: 0}
							]), // crude sine :D
		interpolate('Newton', [
							{x: -2 * Math.PI, y: 1}, 
							{x: -7 * Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: -3 * Math.PI / 2, y: 0},
							{x: -5 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: - Math.PI, y: -1},
							{x: -3 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: - Math.PI / 2, y: 0},
							{x: - Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: 0, y: 1},
							{x: Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: Math.PI / 2, y: 0},
							{x: 3 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: Math.PI, y: -1},
							{x: 5 * Math.PI / 4, y: -Math.sqrt(2) / 2},
							{x: 3 * Math.PI / 2, y: 0},
							{x: 7 * Math.PI / 4, y: Math.sqrt(2) / 2},
							{x: 2 * Math.PI, y: 1}
							]), // crude cosine :D
		interpolate('Newton', [
							{x: -2, y: 1/4},
							{x: -1, y: 1/2},
							{x: 0, y: 1},
							{x: 1, y: 2},
							{x: 2, y: 4}
							]), // exp2 [-2, 2]
		interpolate('Newton', [
							{x: -2, y: 4},
							{x: -1, y: 2},
							{x: 0, y: 1},
							{x: 1, y: 1/2},
							{x: 2, y: 1/4}
							]), // exp.5 [-2, 2]
		interpolate('Newton', [
							{x: 1/1024, y: -10},
							{x: 1/512, y: -9},
							{x: 1/256, y: -8},
							{x: 1/128, y: -7},
							{x: 1/64, y: -6},
							{x: 1/32, y: -5},
							{x: 1/16, y: -4},
							{x: 1/8, y: -3},
							{x: 1/4, y: -2},
							{x: 1/2, y: -1}
							]) // log2 [0<-,1]
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
			height: 150,
			width: 300,
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