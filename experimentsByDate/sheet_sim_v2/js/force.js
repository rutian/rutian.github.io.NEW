// force object

// TODO probably should wrap it up with some nice inheritance stuff...


class force_EdgeSpring {
    
    constructor( particle_a_index, particle_b_index, rest_length, k_spring, k_dampening ) {


        // indices for where the particles are in the big array
        this.ia = particle_a_index;
        this.ib = particle_b_index;
        this.ks = k_spring;
        this.kd = k_dampening;
        this.l = rest_length;

    }

    // use the force to update the current system

    applyForce(particle_system) {
      
        // offset index for the big arrays in particleSystem
        var ia = this.ia*3;
        var ib = this.ib*3; 

        // get position of points
        var pa_x = particle_system.x_list.slice( ia, ia + 3); 
        var pb_x = particle_system.x_list.slice( ib, ib + 3); 
        
        // get distance between points 
        var stretch = distance(pa_x, pb_x) - this.l; // subtract stretch length

        //unit vector from a to b
        var d_ab_norm = norm_dist( pa_x, pb_x );
        var d_ba_norm = norm_dist( pb_x, pa_x );
        
        // force exerted on a by b

        var f_ab = 0;

        if (SPRING_FORCE_OVERRIDE) { // override the spring force given in construcotr with global variable
        
            f_ab = PARTICLE_SPRING_KS * stretch; 


        } else {


            f_ab = this.ks*stretch;

        }

        // accumulate the forces into the particle system's force array
        maccumulate3( particle_system.f_list, ia, d_ab_norm, f_ab ); 
        maccumulate3( particle_system.f_list, ib, d_ba_norm, f_ab ); 

        // dampening forces

        var f_dampen_a = [0,0,0];
        var f_dampen_b = [0,0,0];

        // project va onto d_ab_norm 

        var a_v = particle_system.v_list.slice( ia, ia + 3 );
        var b_v = particle_system.v_list.slice( ib, ib + 3 );

        // these are projected velocities
        var a_proj_v = dot3( a_v, d_ab_norm );
        var b_proj_v = dot3( b_v, d_ba_norm );

        if (SPRING_FORCE_OVERRIDE) {
         
            var f_dampen_a = scalar_mult( -1 * PARTICLE_SPRING_KD * a_proj_v, d_ab_norm);
            var f_dampen_b = scalar_mult( -1 * PARTICLE_SPRING_KD * b_proj_v, d_ba_norm);
         

        }  else {  // do the normal thing

            var f_dampen_a = scalar_mult( -1*this.kd*a_proj_v, d_ab_norm);
            var f_dampen_b = scalar_mult( -1*this.kd*b_proj_v, d_ba_norm);

        } 

        // put in the dampening forces 
        accumulate3( particle_system.f_list, ia, f_dampen_a ); 
        accumulate3( particle_system.f_list, ib, f_dampen_b ); 


   }

} // end class definition
