
// global variables
//var e = true;

var INPLANE_FORCE_VIEW_EN  = false ;
var OUTPLANE_FORCE_VIEW_EN = true;

var GRAVITY_EN = false; 

var PI = 3.1415926535;
var GRAVITY = -9.81;
var TIME_ONE_FRAME = 0.01666666666;
var GLOBAL_D = TIME_ONE_FRAME;
var SQRT2 = 1.4142135624;


var GLOBAL_REST_ANGLE = 0;




var GLOBAL_DAMPENING_RATIO = 0.01;
var PRESSURE = 0.0;



/*******************************************
* VARIABLES FOR PARTICLE CLOTH 
****************************************/

var SPRING_FORCE_OVERRIDE = true;
var PARTICLE_SPRING_KS = 150;
var PARTICLE_SPRING_KD = 0.5;
var MAX_STRAIN = .3;
var ENFORCE_MAX_STRAIN = true;
var solverType = 'verlet'; // supahack


/*******************************************
* VARIABLES FOR SIMPLE CONTINUUM (B + W)
****************************************/


var STRETCH_SPRING_KS = 200;  // 10 
var STRETCH_SPRING_KD = 1;

var SHEAR_SPRING_KS = 200; // 10 
var SHEAR_SPRING_KD = 1;

var BEND_SPRING_KS = .005 ;
var BEND_SPRING_KD = 0  ;

var BEND_SPRING_KD_RATIO = .5;



// variables for full on continuum

var GLOBAL_D_RATIO = 0.1;

var E = 0;
var mu = 0;
var bendingE = 0;


