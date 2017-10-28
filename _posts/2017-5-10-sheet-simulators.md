---
layout: experiment 
title:  Sheet simulation 2 ways
categories: jekyll, web 
permalink: sheetSimulators
---

For the CS284B (graphics), my [partner](http://cearto.com) and I experimented with various approaches for simulating sheet materials.

All simulations where implemented in Javascript with [three.js](https://threejs.org/) and a custom math library. 

![sheet model]({{site.url}}/media/sheetParticle.gif){: .ui .large .centered .image}

[Sheet Model]({{site.url}}/experiments/sheet_sim_v2/particleModel.html), enable gravity to start.
Classic particle based model with strain limiting offering most of the stability. 50x50 node sheet simulated at 60fps.

![sheet model]({{site.url}}/media/sheetSimpleContinuum.gif "triptych"){: .ui .large .centered .image}

[Simple continuum model]({{site.url}}/experiments/sheet_sim_v2/simpleContinuumModel.html), activate by turning on gravity or increasing pressure. Here, I implemented a simple continuum model based on [Large steps in cloth simulation](https://dl.acm.org/citation.cfm?id=280821). A verlet integrator was used instead of an implicit integrator.

![Fancy]({{site.url}}/media/sheetContinuum.gif){: .ui .large .centered .image}
Lastly, I tried to implement a [St. Venant-Kirschhoff]({{site.url}}/experiments/sheet_sim_v2/ContinuumModel.html) model with an anisotropic mesh, but was unable to finish debugging it by the end of the semester.





