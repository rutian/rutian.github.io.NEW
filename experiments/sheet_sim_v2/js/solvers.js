// ODE solvers for motion



// explicit (forward euler) 
// super simple, update element-wise through the particle system x,v,f, and m vectors

function explicitSolver(particle_system, timestep) {

    // euler step

    // for all particles
    
    var a, mass, v_prev, is_fixed;

    var tke = 0;
    // loop through the mega array of forces/velocity/position
    // update element by element

    for ( var i = 0; i < particle_system.f_list.length; i++ ) {

        is_fixed =  particle_system.fixed_list[ Math.floor(i / 3) ];

        // get the forces
        mass = particle_system.m_list[ Math.floor(i / 3) ];
        a = particle_system.f_list[i] / mass;
        
        // update velocities 
        v_prev = particle_system.v_list[i];
         
        particle_system.v_list[i] = v_prev + a * timestep;

                       
        // update positions, if not fixed
        if ( !is_fixed ) {
        
            particle_system.x_list[i] += v_prev * timestep; 
            
        
        } else {

            // fixed particle
            particle_system.v_list[i] = 0;


        }

        // TODO: not actually the kinetic energy, but close enough for now
        // every three iterations, a particel has been processed. calculate kinetic energy
        tke += mass * particle_system.v_list[i] * particle_system.v_list[i];



    } // end for loop

    return tke; 

    

}



// verlet integration. not sure how this works yet
// no need to explicity track velocity

function verletSolver( model, timestep, modelType ) {


    var tke = 0;

    var mass, x_curr, x_prev, x_next, is_fixed;

    var a = 0;

    for ( var i = 0; i < model.f_list.length; i++ ) {

        // retrieve the unpadded stuff
        is_fixed =  model.fixed_list[ Math.floor(i / 3) ];
        mass = model.m_list[ Math.floor(i / 3) ];

        // componentwise accel and position
        
        if (modelType == 'particle') {

            a = model.f_list[i] / mass;

        } else if (modelType === 'simpleContinuum') {

            a = (model.f_list[i] + model.f_list_internal_outPlane[i] + model.f_list_internal_inPlane[i]) / mass;

        }


        x_curr = model.x_list[i];
        x_prev = model.x_prev_list[i];

        // verlet integration step


        x_next =   x_curr  + ( 1 - GLOBAL_DAMPENING_RATIO) * (x_curr - x_prev) + a * timestep * timestep ; 

        // update only if not fixed

        if ( ! is_fixed ) {
 
            model.x_list[i] = x_next;
            model.x_prev_list[i] = x_curr;
            
            model.v_list[i] = ( x_next - x_curr ) / timestep; 

        }
       
        // kinetic energy stunt double 

        var v = (model.x_list[i] - model.x_prev_list[i]) / timestep; 
        tke += mass * v * v; 

    }


    return tke; 

} 


function implicitSolver( particle_system, timestep ) {



    // stretch force jacobians


    // jacobian for dampening


    // fancy math


    // conjugate gradient 



    // update positions

    

}




