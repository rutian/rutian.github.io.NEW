// simple continuum model a la baraff and witkin large steps in cloth sim
// all forces triangle based
// only handles regular meshes


class sheetSimpleContinuumModel{ 
    
    constructor( width, height, particlesPerEdge, totalMass) {
        
        this.n = particlesPerEdge * particlesPerEdge;

        this.totalKE = 0;
       
        // arrays (three per element) (e.g. [px, py, pz, qx, qy, qz, rx, ry, rz, .... etc..]  

        this.x_list = []; // array that will hold all of the positions
        this.x_prev_list = []; // array of previous locations (used in verlet;
        this.x_orig = []; // original positions, used to calculate dstrain
        this.v_list = []; // array for velocities
      
        // split up the forces based on type 
        this.f_list = []; // array for force accumulator 
        
        this.f_list_internal_outPlane = []; // force accumulator for forces out of plane (bending)
        this.f_list_internal_inPlane = []; 
        //this.f_list_external = [];
       
        // 1 per element array ( e.g. [pm, qm, rm, ...]

        this.m_list = []; // masses of particles
        this.fixed_list = []; // boolean isfixed  (could be all three axis) 

 
        // geometric data structs
        this.t_list = []; // list of triangle objects (contains info for strain calculations also
        this.e_list = []; // list of edge objects

        this.forceObjects = []; // shear/bend/stretch force objects

        // parameters of the cloth
        this.w = width;  // physical dimensions
        this.h = height;
        this.s = particlesPerEdge; // discretization
        this.d = this.s - 1;
       
        // even discretization, all triangles equal 
        this.triangleAreaInitial = 0; 



        // some mass calculations
        var totalArea = width * height; 
        this.numTriangles = ( particlesPerEdge - 1 ) * (particlesPerEdge - 1 ) * 2;
        this.areaPerTriangle = totalArea / this.numTriangles;
        this.triangleMass = totalMass / this.numTriangles;

        // start initializing parameters
        var row, col; // indices for 2D
        var x, y;     // locations in world/

        /************************************
        * initialize positions, velocites, forces, 
        ***********************************/
        
        for ( var i = 0; i < this.n; i++ ) {

            // init positions
            row = Math.floor( i / particlesPerEdge);
            col = i % particlesPerEdge;
    
            x = col/( particlesPerEdge - 1 ) * width;
            y = row/( particlesPerEdge - 1 )  * height;
            
            // y is pointed up (cloth needs to be on xz plane)
            this.x_list.push( x, 0, y );
            this.x_prev_list.push( x, 0, y );
            this.x_orig.push( x, 0, y );

            // init velocities, forces, masses
            this.v_list.push( 0, 0, 0 );
            this.f_list.push( 0, 0, 0 );
            this.f_list_internal_outPlane.push( 0, 0, 0);
            this.f_list_internal_inPlane.push( 0, 0, 0);

            this.m_list.push( 0 ); 

            this.fixed_list.push(false);

        }


        /************************************
        * add in the triangles, and accumulate 
        * correct masses to particles
        ***************************************/ 

        var tempTriangle; // for adding shear and stretch forces
        var tempEdge;     // for adding edge forces
        var thirdTriangleMass = this.triangleMass / 3;
        var lastRowStartIndex = this.n - particlesPerEdge;

        for ( var i = 0; i < lastRowStartIndex; i ++ ) {

            // only add if not in last column
            if ( (i % particlesPerEdge) != (particlesPerEdge - 1) ) { 

                tempTriangle = new triangleForSimpleContinuum( this.x_list, i, i + particlesPerEdge , i + particlesPerEdge + 1 );
                this.t_list.push( tempTriangle );
                
                tempTriangle = new triangleForSimpleContinuum( this.x_list, i, i + particlesPerEdge + 1, i + 1 );
                this.t_list.push( tempTriangle );
               
                 
                // edge between the last two triangles that were added

                var actuatedEdge = false; // driven vs passive edge
    
                // for the forces between diagonals
                tempEdge = new edgeForSimpleContinuum( i + particlesPerEdge, i + 1, i, i + particlesPerEdge + 1, this.t_list.length - 2, this.t_list.length - 1 ); 
                this.e_list.push( tempEdge );

                // s is particles per edge
                if ( i % particlesPerEdge != 0 ) {   // if not in first column. For the edges between columns

                    // hardcode in some demos for folding
                    actuatedEdge = (i % particlesPerEdge === Math.floor(particlesPerEdge / 2 ) ) ? true : false;  // true if condition met
                    
                    tempEdge = new edgeForSimpleContinuum( i - 1, 
                                                           i + particlesPerEdge + 1, 
                                                           i + particlesPerEdge , 
                                                           i , 
                                                           this.t_list.length - 3, 
                                                           this.t_list.length - 2, 
                                                           actuatedEdge);
                    this.e_list.push( tempEdge ); 
                }            

                if ( i >= particlesPerEdge ) {   // if not in first row. For the edges between rows
                    
                    tempEdge = new edgeForSimpleContinuum( i + particlesPerEdge + 1,
                                                           i - particlesPerEdge + 0, 
                                                           i + 1 , 
                                                           i + 0,  
                                                           this.t_list.length - 1 , // reach into the last row
                                                           this.t_list.length - 2 * particlesPerEdge,  // last element
                                                           false); // not actuated
                                                 //this.t_list.length - 2 * (particlesPerEdge )
                    this.e_list.push( tempEdge );
                
                }            


                // update the masses based on the number of particles incident
                this.m_list[i]                        += 2 * thirdTriangleMass;
                this.m_list[i+1]                      += thirdTriangleMass;   
                this.m_list[i + particlesPerEdge]     += thirdTriangleMass; 
                this.m_list[i + particlesPerEdge + 1] += 2 * thirdTriangleMass;  

            }

        }


        /*******************************
        *
        * CONSTRAIN some of the points
        *
        ********************************/
        
        //this.constrainDiagonalCorners();
        //this.constrain_corners();
        this.constrain_edges();
        //this.constrain_2_middle_x(); // for testing
        //this.constrain_2_middle_y(); // also for testing

 
        /*****************************************************
        * add in continuum forces for the triangles and edges
        ******************************************************/

        for ( var i = 0; i < this.t_list.length ; i ++ ) { 
            
            // for the shear and stretch forces           
            var force = new triangleAreaForce(i);
            this.forceObjects.push(force);

        }


        for ( var i = 0; i < this.e_list.length ; i ++ ) {


            // for edge forces
            var force = new triangleEdgeForce(i, PI/3);
            this.forceObjects.push(force);

        }


    }  // end of constructor
  

    // clear all forces in the model. TODO: some inheritance would be nice...
  
    clearForce() {
        
        for ( var i = 0; i < this.f_list.length ; i++ ) {
            
            this.f_list[i] = 0;
            this.f_list_internal_outPlane[i] = 0;
            this.f_list_internal_inPlane[i] = 0;
        }

    }

    

    // update some things for a new step in iteration
    // e.g. triangle normals, strain vectors, strain derivitives
    
    getYoShitTogether() {

        for ( var i = 0; i < this.t_list.length; i++ ) {

            this.t_list[i].updateNormalAndArea( this.x_list );
            this.t_list[i].updateStrain( this.x_list );



        } 

    }


    // gravity forces applied to triangles
 
    applyGravityForce() {
      
        var force = this.triangleMass * GRAVITY / 3;
        var index = [0,0,0];
         
        for ( var i = 0; i < this.numTriangles; i ++ ) {
   
            // accumulate the force into each of the triangle's vertices
            index = this.t_list[i].points;
            this.f_list[index[0]*3 + 1] += force;
            this.f_list[index[1]*3 + 1] += force;
            this.f_list[index[2]*3 + 1] += force;

        } 

    }


    // identical to particleModel.. TODO inherit this from superclass

    applyGlobalDampeningForce() {

        for ( var i = 0; i < this.n ; i++ ) {

            // get the velocity for each particle 

            // applied in the integrator

            //this.f_list[i*3 + 0] += -1 * this.v_list[i*3 + 0] * CONTINUUM_GLOBAL_D; 
            //this.f_list[i*3 + 1] += -1 * this.v_list[i*3 + 1] * CONTINUUM_GLOBAL_D;
            //this.f_list[i*3 + 2] += -1 * this.v_list[i*3 + 2] * CONTINUUM_GLOBAL_D;

        }

    }

    // pressure force applied to each triangle

    applyPressureForce( pressure ) {

        var normalVector = [0, 0, 0];
        var pointsIndex  = [0, 0, 0];
       
        // split up the pressure force for each of the three points 

        var pressureForcePer = pressure / 3;


        for ( var i = 0; i < this.numTriangles ; i++ ) {
            
            normalVector = this.t_list[i].normal;
            pointsIndex  = this.t_list[i].points;
            var area = this.t_list[i].area; 
            var pressureForcePerWithArea = pressureForcePer * this.t_list[i].area; 

            maccumulate3( this.f_list, pointsIndex[0]*3 , normalVector, pressureForcePerWithArea );
            maccumulate3( this.f_list, pointsIndex[1]*3 , normalVector, pressureForcePerWithArea );
            maccumulate3( this.f_list, pointsIndex[2]*3 , normalVector, pressureForcePerWithArea );

        }

    }

    // apply all other force objects: shear/stretch/bend

    applyForceObjects() {

        this.applyPressureForce(PRESSURE);
    
        for ( var i = 0; i < this.forceObjects.length ; i++ ) {

            this.forceObjects[i].applyForce( this );

        }
        
    }


    updateAllNormals() {



    }

    // constrain certain points

    constrain_edges() {

        var inFirstRow = false;
        var inFirstColumn = false;
        var inLastRow = false;
        var inLastColumn = false; 
        var last_row_start_index = this.n - this.d - 1;
        

        for ( var i = 0; i < this.n ; i++ ) {
    
            inFirstRow = i < this.s;
            inFirstColumn = i % this.s === 0; 
            inLastRow = i >= last_row_start_index; 
            inLastColumn = i % (this.s) === (this.s - 1) ;

            if ( inFirstRow || inLastRow || inFirstColumn || inLastColumn ) {

                this.fixed_list[i] = true;

            } 

        }


    }


    //constrain two corners

    constrainDiagonalCorners() {

        this.fixed_list[0] = true;  // NW
        this.fixed_list[this.fixed_list.length - 1] = true; // SE

    }
    

    // constrain all corners

    constrain_corners() {

        this.fixed_list[0] = true;  // NW
        this.fixed_list[this.fixed_list.length - 1] = true; // SE

        this.fixed_list[this.s - 1] = true; // NE
        this.fixed_list[this.fixed_list.length  - this.s] = true; // SW


    }

    // constrain 2 corners on one edge

    constrain_2_corners() {

        this.fixed_list[0] = true; 

        this.fixed_list[this.s - 1] = true; 
    }

   
    constrain_2_middle_x() {

        var i = Math.floor( this.s /2 );
        var j = this.n - 1 - i;
        
        this.fixed_list[i] = true;
        this.fixed_list[j] = true;
        
    }


    constrain_2_middle_y() {

        var i = Math.floor( this.s / 2 ) ;
       
        var j = i * this.s;
        var k = j + this.s - 1;

        this.fixed_list[j] = true;
        this.fixed_list[k] = true; 

    }

 
} // end sheetSimpleContinuumModel



// force for both shear and stretch (forces within a triangle

class triangleAreaForce{

    constructor( t  ) { // just takes indice of triangle in t_list

        this.t_index = t;

        // don't need to keep track of the ks/kd... they are the same for all triangle forces

    }

    // calculate and apply shear and stretch forces

    applyForce( model ) {

       
        // some variables used for both stretch and shear calculations
 
        var area = model.areaPerTriangle; // should be the same for this simple formulation

        var triangle = model.t_list[this.t_index];
        
        var normalizedStrainU = scalar_mult( 1/triangle.strainUnorm, triangle.strainU );
        var normalizedStrainV = scalar_mult( 1/triangle.strainVnorm, triangle.strainV );


        /****************************       
        * first the stretch forces 
        ****************************/ 

        // don't care about anisotropy, want strain to be 1
        var Cu = area * ( triangle.strainUnorm - 1); // scalar
        var Cv = area * ( triangle.strainVnorm - 1); // scalar

       
        var delCu_delxi = scalar_mult( triangle.delStrainU_delXi , normalizedStrainU ); 
        var delCu_delxj = scalar_mult( triangle.delStrainU_delXj , normalizedStrainU ); 
        var delCu_delxk = scalar_mult( triangle.delStrainU_delXk , normalizedStrainU ); 

        var delCv_delxi = scalar_mult( triangle.delStrainV_delXi , normalizedStrainV );
        var delCv_delxj = scalar_mult( triangle.delStrainV_delXj , normalizedStrainV );
        var delCv_delxk = scalar_mult( triangle.delStrainV_delXk , normalizedStrainV );


        // compute the forces

        var fi = weightedVectorAdd3( Cu, delCu_delxi, Cv, delCv_delxi);
        var fj = weightedVectorAdd3( Cu, delCu_delxj, Cv, delCv_delxj);
        var fk = weightedVectorAdd3( Cu, delCu_delxk, Cv, delCv_delxk);

        var scaling = -1 * STRETCH_SPRING_KS * area * area;

        // dampening forces

        var vi = get3( model.v_list, triangle.points[0] * 3 );     // start by projecting the velocities
        var vj = get3( model.v_list, triangle.points[0] * 3 );     // start by projecting the velocities
        var vk = get3( model.v_list, triangle.points[0] * 3 );     // start by projecting the velocities

         
        var df_scaling = -1 * STRETCH_SPRING_KD * area * area;

        // dampening

        var dfi = weightedVectorAdd3( dot3( delCu_delxi, vi ) , delCu_delxi, dot3( delCv_delxi, vi ) , delCv_delxi);
        var dfj = weightedVectorAdd3( dot3( delCu_delxj, vj ) , delCu_delxj, dot3( delCv_delxj, vj ) , delCv_delxj); 
        var dfk = weightedVectorAdd3( dot3( delCu_delxk, vk ) , delCu_delxk, dot3( delCv_delxk, vk ) , delCv_delxk);


        maccumulate3( model.f_list_internal_inPlane, triangle.points[0] * 3, fi, scaling ); 
        maccumulate3( model.f_list_internal_inPlane, triangle.points[0] * 3, dfi, df_scaling ); 
        
        maccumulate3( model.f_list_internal_inPlane, triangle.points[1] * 3, fj, scaling ); 
        maccumulate3( model.f_list_internal_inPlane, triangle.points[1] * 3, dfj, df_scaling ); 

        maccumulate3( model.f_list_internal_inPlane, triangle.points[2] * 3, fk, scaling ); 
        maccumulate3( model.f_list_internal_inPlane, triangle.points[2] * 3, dfk, df_scaling ); 


        /****************************       
        * now the shear forces 
        ****************************/ 

        // do an additional normalization in case our stretch spring isn't stiff enough
        var Cshear = dot3( normalizedStrainU, normalizedStrainV );
        Cshear = area * Cshear;  

        var del_Cshear_delxi = weightedVectorAdd3(triangle.delStrainV_delXi, normalizedStrainU, triangle.delStrainU_delXi, normalizedStrainV);
        var del_Cshear_delxj = weightedVectorAdd3(triangle.delStrainV_delXj, normalizedStrainU, triangle.delStrainU_delXj, normalizedStrainV);
        var del_Cshear_delxk = weightedVectorAdd3(triangle.delStrainV_delXk, normalizedStrainU, triangle.delStrainU_delXk, normalizedStrainV);

        // update the fi
        fi = del_Cshear_delxi;
        fj = del_Cshear_delxj;
        fk = del_Cshear_delxk;

        scaling = -1 * SHEAR_SPRING_KS * Cshear * area;

        //TODO maybe use maccumulate3 once when both shear and stretch have been computed
        maccumulate3( model.f_list_internal_inPlane, triangle.points[0] * 3, fi, scaling ); 
        maccumulate3( model.f_list_internal_inPlane, triangle.points[1] * 3, fj, scaling ); 
        maccumulate3( model.f_list_internal_inPlane, triangle.points[2] * 3, fk, scaling ); 

         
    }


}

/************************************************************
*
* bending forces for each edge. Parameterized in terms of the angle
*
****************************************************************/

class triangleEdgeForce {

    // p0 and p1 refer to the points on t0 and t1 that the bending force acts on
    // p2 and p3 are on the edge

    constructor( e, rest) {

        this.edgeIndex = e;
        //this.restAngle = rest; 
        this.restAngle = 0;
    
    } 
    
    applyForce( model ) {

        // the forces we want to solve for

        var edgeObject = model.e_list[this.edgeIndex];

        var triangleArea = model.t_list[edgeObject.t0].area; // assume all triangles have same area 

        // force on the particles on either side of the dge

        var f0 = [0,0,0];
        var f1 = [0,0,0];

        // get some angles
        var n0 = model.t_list[edgeObject.t0].normal;
        var n1 = model.t_list[edgeObject.t1].normal;
        var e = positionArrayNormVector( model.x_list, edgeObject.p2 * 3, edgeObject.p3 * 3 );

        var cosineTheta =  dot3( n0, n1 );
        var sineTheta = dot3( cross3( n0, n1 ), e );
        var tanTheta = sineTheta/cosineTheta; 
    
        var theta = Math.atan2( sineTheta, cosineTheta );


        // start calculating the derivitives 

        // all the terms in delTheta_delX_ that are constants
        var coeff = 1 / ( 1 + tanTheta * tanTheta );
        coeff = coeff / ( cosineTheta * cosineTheta ); // divided by lolo (as in lodihi minus hidilo over lolo)


        // some jacobian business. jacobian of the normal wrt the point that is moving

        var i = [1, 0, 0];
        var j = [0, 1, 0];
        var k = [0, 0, 1];


        // x3_plus_x2 should be scaled such that the normal computed from these vectors is unit length

        var x3_plus_x2 = positionArrayVectorAdd3(model.x_list, edgeObject.p3*3, edgeObject.p2*3 );
        var e_length = positionArrayDist(model.x_list, edgeObject.p3*3, edgeObject.p2*3);

        // the scale by triangle area x2 ( cross product is the parallelogram area ) 
    
        x3_plus_x2 = scalar_mult( 1/(2*triangleArea), x3_plus_x2 ); 


        var j_n0_x0_r1 = cross3( x3_plus_x2, i );  // rows 1, 2, and 3
        var j_n0_x0_r2 = cross3( x3_plus_x2, j ); 
        var j_n0_x0_r3 = cross3( x3_plus_x2, k );

        //j_n1_x1_r1 ... all of these are the same as the ones for normal0 because they only depend on the points on the shared edge
        // var j_n1_x1_r1 = j_n0_x0_r1;
 

        var delCos_delx0 = [dot3(j_n0_x0_r1, n1), 
                            dot3(j_n0_x0_r2, n1), 
                            dot3(j_n0_x0_r3, n1) ];

        var delCos_delx1 = [dot3(j_n0_x0_r1, n0),
                            dot3(j_n0_x0_r2, n0),
                            dot3(j_n0_x0_r3, n0) ]; 


        var delSin_delx0 = [dot3( cross3( j_n0_x0_r1, n1) , e ),
                            dot3( cross3( j_n0_x0_r2, n1) , e ),
                            dot3( cross3( j_n0_x0_r3, n1) , e )]; 
 

        var delSin_delx1 = [dot3( cross3( n0, j_n0_x0_r1), e ),
                            dot3( cross3( n0, j_n0_x0_r2), e ),
                            dot3( cross3( n0, j_n0_x0_r3), e )]; 
 

        // without the coefficients from the chain rule and the 'lolo'
        var delTheta_delX0 = weightedVectorAdd3( cosineTheta, delSin_delx0, -1 * sineTheta, delCos_delx0);
        var delTheta_delX1 = weightedVectorAdd3( cosineTheta, delSin_delx1, -1 * sineTheta, delCos_delx1);

        delTheta_delX0 = scalar_mult( coeff, delTheta_delX0 );
        delTheta_delX1 = scalar_mult( coeff, delTheta_delX1 );

        theta;
        this.restAngle; 


        var angle_0 = 0;

        if (edgeObject.isActuated) {
            angle_0 = GLOBAL_REST_ANGLE;
        } else {
            
            angle_0 = 0; 
        }

        var diffAngle = angle_0 - theta;
        var diffAngleCubed = diffAngle * diffAngle * diffAngle;
        diffAngleCubed = diffAngle; // test out non-cubic and stability
 
        f0 = scalar_mult( -2 * BEND_SPRING_KS * (diffAngleCubed) * e_length, delTheta_delX0 ); 
        f1 = scalar_mult(  2 * BEND_SPRING_KS * (diffAngleCubed) * e_length, delTheta_delX1 );


        // project velocity onto the direction of the force (constraint gradient)

        var v0 = get3( model.v_list, edgeObject.p0*3 );
        var v1 = get3( model.v_list, edgeObject.p1*3 );
 
        var v0_dot_gradient = dot3( v0, delTheta_delX0 );  
        var v1_dot_gradient = dot3( v1, delTheta_delX1 ); 
       
        // calculate and accumulate dampening
        var f0_d = scalar_mult( -1 * BEND_SPRING_KD * ( angle_0 - theta ) * v0_dot_gradient , delTheta_delX0 );
        var f1_d = scalar_mult( 1 * BEND_SPRING_KD * ( angle_0 - theta ) * v1_dot_gradient , delTheta_delX1 );

        // put in the forces into the f_list!!!!

        model.f_list;

        // bending forces
        maccumulate3( model.f_list_internal_outPlane, edgeObject.p0 * 3, f0, 1 - BEND_SPRING_KD_RATIO  );
        maccumulate3( model.f_list_internal_outPlane, edgeObject.p1 * 3, f1, 1 - BEND_SPRING_KD_RATIO  );

        // bending damping forces
        //accumulate3( model.f_list_internal_outPlane, edgeObject.p0 * 3, f0_d );
        //accumulate3( model.f_list_internal_outPlane, edgeObject.p1 * 3, f1_d );

        model.f_list;

        // wow... we are done
        
    } // end accumulate force
} // end 



// edge class for tracking topology info necessary for the continuum bending forces
// only tracking the interior edges. boundary edges contribute no force

class edgeForSimpleContinuum {

   constructor( p_0, p_1, p_2, p_3, t_0, t_1, boolActuated ) {

        this.p0 = p_0; // opposite edge
        this.p1 = p_1; // opposite edge
        
        this.p2 = p_2; // on edge
        this.p3 = p_3; // on edge

        this.t0 = t_0; // triangle 0 
        this.t1 = t_1; // triangle 1

    
        this.isActuated = boolActuated; // one of the folds? 

    } 


}


//  triangle class for tracking forces in simple continuum model


class triangleForSimpleContinuum {

    // initial position of the three points
    // same as before, pi, pj, pk are indices in point array
    // not the actual points

    constructor(positionList, pi, pj, pk ) {

        this.points = [pi, pj, pk];
        this.normal = [0, 0, 0]; 
        this.updateNormalAndArea(positionList);  
        this.area = 0;
        this.mass = 0;

        // for the continuum force calculations, store them within the triangle because they will be used for multiple forces
       
        //positionList[pi*3] 

        //initialize deltaU/Vx with initial position 

        var deltU1 = positionList[pj*3] - positionList[pi * 3]; // in the x dir
        var deltU2 = positionList[pk*3] - positionList[pi * 3]; // in the x dir
        var deltV1 = positionList[pj*3 + 2] - positionList[pi * 3 + 2]; // in the z dir
        var deltV2 = positionList[pk*3 + 2] - positionList[pi * 3 + 2]; // in the z dir

    
        this.deltaUVmatrix = [ [deltU1, deltV1] , [deltU2, deltV2] ];  // function of the original positions only
        this.deltaUVmatrixINV =  invert2x2( this.deltaUVmatrix ) ;
        
        this.strainU = [0, 0, 0];
        this.strainUnorm = 0;
        this.strainV = [0, 0, 0];
        this.strainVnorm = 0;

        // given current positions and uv matrix, calculate the strain...
        this.updateStrain( positionList ); 

    
        // partial derivitives
        // del meaning partial derivitive, not nabla
        // all of the following are  delTrainU_delXi = constant * I ; here we only store the constant
            
        // helper indices from the deltaUV amtrix 
        var a = this.deltaUVmatrixINV[0][0];
        var b = this.deltaUVmatrixINV[0][1]; 
        var c = this.deltaUVmatrixINV[1][0];    
        var d = this.deltaUVmatrixINV[1][1]; 

        this.delStrainU_delXi = -1 * (a+b);
        this.delStrainU_delXj = a;
        this.delStrainU_delXk = b;
    
        this.delStrainV_delXi = -1 * (c+d);
        this.delStrainV_delXj = c;
        this.delStrainV_delXk = d;
    }


    updateNormalAndArea( positionList ) {

        var tempCross = crossProductThreePoints( positionList, this.points[0], this.points[1], this.points[2] );
        //tempCross = normalFromThreePoints( positionList, this.points[0], this.points[1], this.points[2] );


        this.normal = normalize3(tempCross); 
        this.area   = magnitude3(tempCross) / 2;

        //umm
        //console.log('yo');

    }
    

    // update the discretized strain measure

    updateStrain( positionList ) {

        var deltx1 = [0,0,0];
        var deltx2 = [0,0,0]; 

        deltx1 = positionArrayVector( positionList, this.points[0]*3, this.points[1]*3); // xj - xi (vector from xi to xj)
        deltx2 = positionArrayVector( positionList, this.points[0]*3, this.points[2]*3); // xk - xi (vector from xi to xk)

        var a = this.deltaUVmatrixINV[0][0];
        var b = this.deltaUVmatrixINV[0][1];
        var c = this.deltaUVmatrixINV[1][0];
        var d = this.deltaUVmatrixINV[1][1];
        
        this.strainU =  v_add( scalar_mult( a, deltx1 ), scalar_mult( b, deltx2 ) ); 
        this.strainV =  v_add( scalar_mult( c, deltx1 ), scalar_mult( d, deltx2 ) );
       
        this.strainUnorm = magnitude3( this.strainU );
        this.strainVnorm = magnitude3( this.strainV );       

    }


}
