// class for triangles. 
// contains geometric info, as well as for forces

class ContinuumTriangle {

    constructor( points, i, j, k, rho, thickness) {
   
        this.pointsPointer = points;
        this.mass = 0;
        this.area = 0;
        this.normal  = new Float32Array( 3 );
        this.t = 0;
        this.volume = 0;

        this.li = 0; // edge lengths
        this.lj = 0;
        this.lk = 0;

        this.li0 = 0; // initial edge lengths
        this.lj0 = 0;
        this.lk0 = 0; 

        this.pindexI = i;
        this.pindexJ = j;
        this.pindexK = k;

        this.Ti = [0,0,0];       // unit vector normal to edge i
        this.Tj = [0,0,0];
        this.Tk = [0,0,0];

        this.tensorI = new Float32Array( 9 ); // tensors [ tj (x) tk + tk (x) tj ]
        this.tensorJ = new Float32Array( 9 );
        this.tensorK = new Float32Array( 9 );    

        this.tensorII = new Float32Array( 9 ); // tensorI * tensorI
        this.tensorJJ = new Float32Array( 9 );
        this.tensorKK = new Float32Array( 9 );
        this.tensorIJ = new Float32Array( 9 ); 
        this.tensorJI = new Float32Array( 9 );
        this.tensorIK = new Float32Array( 9 );
        this.tensorKI = new Float32Array( 9 );
        this.tensorJK = new Float32Array( 9 );
        this.tensorKJ = new Float32Array( 9 ); 

        this.strainEnergyConstant = 0; // constant coefficient for inplane strain energy
   

        this.E  = [0,0,0,0,0,0,0,0,0]; //Strain
        this.E2 = [0,0,0,0,0,0,0,0,0]; // (strain tensor) x (strain tensor)

        this.TrE = 0; // trace of strain
        this.TrE2 = 0; // trace of strain squared  (Tr(e))^2

        this.delTrEdelxi = [0,0,0]; // partial derivitive of tr(e)
        this.delTrEdelxj = [0,0,0];
        this.delTrEdelxk = [0,0,0];

        this.delTrE2delxi = [0,0,0]; // partial derivs of (tr(e))^2
        this.delTrE2delxj = [0,0,0];
        this.delTrE2delxk = [0,0,0];
    


        // START COMPUTING THOSE PARAMETERS

        this.t = thickness;
        this.normal = normalFromThreePoints( points, i, j, k );  //normalFromThreePoints( pArray, p1i, p2i, p3i ); // in CCW ordering
        this.area = areaThreePoints( points, i, j, k);  // TODO overlapping computation between area and normal
        this.area2 = this.area * this.area;
        this.volume = this.area * this.t;
        this.mass = this.volume * rho; 


        // Strains and shit;askdjf;aijefa;oif

        this.Ti = positionArrayNormVector( points, j*3, k*3 );  // normal vector pointing from edge i (point j to point k)
        this.Tj = positionArrayNormVector( points, k*3, i*3 );
        this.Tk = positionArrayNormVector( points, i*3, j*3 );

        // rotate them so they actually point outward
        this.Ti = rotate90CW(this.Ti);
        this.Tj = rotate90CW(this.Tj);
        this.Tk = rotate90CW(this.Tk);

        this.li0 = positionArrayDist( points, k * 3, j * 3);
        this.lj0 = positionArrayDist( points, k * 3, i * 3);
        this.lk0 = positionArrayDist( points, i * 3, j * 3);

        // these tensors are constant ( unless implemenitng permanent deformation ) 

        this.tensorI = matadd3 (outerProd3( this.Tj, this.Tk ), outerProd3( this.Tk, this.Tj ) );
        this.Tr_tensorI = trace3( this.tensorI );

        this.tensorJ = matadd3 (outerProd3( this.Ti, this.Tk ), outerProd3( this.Tk, this.Ti ) );
        this.Tr_tensorJ = trace3( this.tensorJ ); 

        this.tensorK = matadd3 (outerProd3( this.Ti, this.Tj ), outerProd3( this.Tj, this.Ti ) );
        this.Tr_tensorK = trace3( this.tensorJ ); 
        // these tensors are also constant

        this.tensorII = matmul3(this.tensorI, this.tensorI);   this.Tr_tensorII = trace3( this.tensorII );
        this.tensorJJ = matmul3(this.tensorJ, this.tensorJ);   this.Tr_tensorJJ = trace3( this.tensorJJ );
        this.tensorKK = matmul3(this.tensorK, this.tensorK);   this.Tr_tensorKK = trace3( this.tensorKK ); 
        this.tensorIJ = matmul3(this.tensorI, this.tensorJ);   this.Tr_tensorIJ = trace3( this.tensorIJ );
        this.tensorJI = matmul3(this.tensorJ, this.tensorI);   this.Tr_tensorJI = trace3( this.tensorJI );
        this.tensorIK = matmul3(this.tensorI, this.tensorK);   this.Tr_tensorIK = trace3( this.tensorIK );
        this.tensorKI = matmul3(this.tensorK, this.tensorI);   this.Tr_tensorKI = trace3( this.tensorKI );
        this.tensorJK = matmul3(this.tensorJ, this.tensorK);   this.Tr_tensorJK = trace3( this.tensorJK );
        this.tensorKJ = matmul3(this.tensorK, this.tensorJ);   this.Tr_tensorKJ = trace3( this.tensorKJ );
        
        // update the strains, squared strains, strain derivs, square strain derivs

        this.strainEnergyConstant = 0.0625 / ( this.area * this.area ); // 1/16
        this.updateStrain(); 


    

    }

    updateNormalAreaThickness() {

        this.normal = normalFromThreePoints( this.pointsPointer, this.pindexI, this.pindexJ , this.pindexK  );
        this.area = areaThreePoints( this.pointsPointer, this.pindexI, this.pindexJ, this.pindexK) ;
        this.area2 = this.area * this.area;  
        this.thickness = this.volume / this.area; // assume constant volume

        this.strainEnergyConstant = 0.0625 / ( this.area * this.area ); // update with new area


    }

    // update strains, and the strain derivatives

    updateStrain() {

        var li = positionArrayDist( this.pointsPointer, this.pindexK * 3, this.pindexJ * 3);
        var lj = positionArrayDist( this.pointsPointer, this.pindexK * 3, this.pindexI * 3);
        var lk = positionArrayDist( this.pointsPointer, this.pindexJ * 3, this.pindexI * 3);

        this.li = li;
        this.lj = lj;
        this.lk = lk;

        var resi = li*li - this.li0 * this.li0; // residual of squares
        var resj = lj*lj - this.lj0 * this.lj0;
        var resk = lk*lk - this.lk0 * this.lk0;


        this.TrE = this.strainEnergyConstant * ( resi * this.Tr_tensorI + resj * this.Tr_tensorJ + resk * this.Tr_tensorK ) ;
        
        // lotsa shit in this one eh
 
        this.TrE2 =  this.strainEnergyConstant * this.strainEnergyConstant * ( resi * resi * this.Tr_tensorII + 
                                                                               resj * resj * this.Tr_tensorJJ +
                                                                               resk * resk * this.Tr_tensorKK +
                                                                               resi * resj * this.Tr_tensorIJ +
                                                                               resj * resk * this.Tr_tensorJK +
                                                                               resi * resk * this.Tr_tensorIK +
                                                                               resj * resi * this.Tr_tensorJI +
                                                                               resk * resj * this.Tr_tensorKJ +
                                                                               resk * resi * this.Tr_tensorKI ); 

    
        this.TrE;
        this.TrE2;
                                                                               

    }


    // yup

    updateStrainDerivs() {


        var coeff1 = 0.625 / this.area2;
       
        // calculate some distance vectors

        var dnij = positionArrayNormVector( this.pointsPointer, this.pindexK * 3, this.pindexJ * 3);   // normal distance i to j
        var dnjk = positionArrayNormVector( this.pointsPointer, this.pindexK * 3, this.pindexJ * 3);
        var dnki = positionArrayNormVector( this.pointsPointer, this.pindexK * 3, this.pindexJ * 3);

        var li2 = this.li * this.li;
        var lj2 = this.lj * this.lj;
        var lk2 = this.lk * this.lk;

        var scalarI = this.Tr_tensorI * 2 * li2;
        var scalarJ = this.Tr_tensorJ * 2 * lj2; 
        var scalarK = this.Tr_tensorK * 2 * lk2;

        // definitely have to double check the following math:
        // should all be 3to 1
        this.delTrEdelxi = scalar_mult( coeff1, weightedVectorAdd3( -1 * scalarJ, dnki,  1 * scalarK, dnij ));  
        this.delTrEdelxj = scalar_mult( coeff1, weightedVectorAdd3( -1 * scalarK, dnij,  1 * scalarI, dnjk ));   
        this.delTrEdelxk = scalar_mult( coeff1, weightedVectorAdd3( -1 * scalarI, dnjk,  1 * scalarJ, dnki ));

        // onto the derivatives of Tr(e^2). let's us do the shear stuff

    }


    // accumulate force induced by the stretch and shear forces of the triangle into
    // the force list (indexed by vertex)


    applyForce( forceList ) {


        //NOTE: updateNormalAreaThickness and updateStrain() AND updateStrainDerivs() MUST be called first to have the correct strain/area/all dat

        var fi = [0,0,0];   
        var fj = [0,0,0];
        var fk = [0,0,0];


        var coeff  = 0.5 * this.volume * YOUNGS / ( 1 - NU * NU );  


        fi = v_add( scalar_mult( 1 - NU , this.delTrE2delxi ) , scalar_mult( 2 * NU * this.TrE, this.delTrEdelxi) ) ; 

        fj = v_add( scalar_mult( 1 - NU , this.delTrE2delxj ) , scalar_mult( 2 * NU * this.TrE, this.delTrEdelxj) ) ; 

        fk = v_add( scalar_mult( 1 - NU , this.delTrE2delxk ) , scalar_mult( 2 * NU * this.TrE, this.delTrEdelxk) ) ; 


        // scalar goes last in maccumulate
        maccumulate3( forceList, this.pindexI * 3, fi, coeff);
        maccumulate3( forceList, this.pindexJ * 3, fj, coeff);
        maccumulate3( forceList, this.pindexK * 3, fk, coeff);




    }




}
