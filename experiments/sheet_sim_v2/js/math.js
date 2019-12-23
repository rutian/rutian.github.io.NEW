//MATH
//MATH
//MATH
//MATH
//MATH
//MATH
//MATH
//MATH
//MATH
//MATH


// return the magnitude of a vector

function magnitude3( v ) {

    ret = 0;
    ret += v[0] * v[0];
    ret += v[1] * v[1];
    ret += v[2] * v[2];
    return Math.sqrt(ret);

}

// distance between a and b

function distance( a, b ) {

    var ret = 0; 
    var component_diff = 0;

    for ( var i = 0; i < 3; i++ ) {

        component_diff = b[i] - a[i];
        ret += (component_diff * component_diff);        
    
    }

    return Math.sqrt(ret); 

}



// normalized vector pointing from a TO b 

function norm_dist( a, b ) {

    var ret = [];
    
    var d = distance( a, b ) ;

    // unrolled loop
    ret[0] = (b[0]-a[0])/d;
    ret[1] = (b[1]-a[1])/d;
    ret[2] = (b[2]-a[2])/d;

    return ret;
}

// for three vector
// pass by value, but value of array is its address. Will edit the v passed in

function scalar_mult( s, v ) {

    var ret = [];

    ret[0] = v[0] * s;
    ret[1] = v[1] * s;
    ret[2] = v[2] * s;

    return ret;

}


// return weighted sum of 2 vectors of length three

function weightedVectorAdd3( s1, v1, s2, v2 ) {

    var ret = [0,0,0];

    ret[0] = s1 * v1[0] + s2 * v2[0];
    ret[1] = s1 * v1[1] + s2 * v2[1];
    ret[2] = s1 * v1[2] + s2 * v2[2];

    return ret;


}

// everything for length three

function v_add( v1, v2 ) {

    var ret = [];
    
    ret[0] = v1[0] + v2[0]; 
    ret[1] = v1[1] + v2[1]; 
    ret[2] = v1[2] + v2[2]; 
    
    return ret;

}

// sub v2 from v1. both length three 

function vSub3( v1, v2 ) {

    var ret = [];
    
    ret[0] = v1[0] - v2[0]; 
    ret[1] = v1[1] - v2[1]; 
    ret[2] = v1[2] - v2[2]; 
    
    return ret;

}



// length three dot product

function dot3( v1, v2 ) {

    var ret = 0;

    ret += v1[0]*v2[0];
    ret += v1[1]*v2[1];
    ret += v1[2]*v2[2];

    return ret;

} 


// normalize a length 3 vector

function normalize3( v ) {

    var ret = [0, 0, 0];
    var d = magnitude3( v ); 

    ret[0] = v[0] / d;
    ret[1] = v[1] / d;
    ret[2] = v[2] / d;

    return ret;

}

// cross product between two vectors

function cross3( u, v ) {

    var ret = [0, 0, 0]; 

    ret[0] = u[1] * v[2] - u[2] * v[1];
    ret[1] = u[2] * v[0] - u[0] * v[2];
    ret[2] = u[0] * v[1] - u[1] * v[0];

    return ret;
}

/**************************************
*
*  math specifically for the big position vectors
*
***************************************/


// accumulate v2 into v1. for 3 vectors

function accumulate3( v1, start_index, v2 ) {

    v1[start_index] = v1[start_index] + v2[0]; 
    v1[start_index + 1] = v1[start_index + 1] + v2[1]; 
    v1[start_index + 2] = v1[start_index + 2] + v2[2]; 

}

// multiply and accumulate for length 3 vectors

function maccumulate3( v1, start_index, v2, scalar ) {

    v1[start_index] = v1[start_index] + scalar * v2[0]; 
    v1[start_index + 1] = v1[start_index + 1] + scalar * v2[1]; 
    v1[start_index + 2] = v1[start_index + 2] + scalar * v2[2]; 

}

// set three elts of v to v2, starting from start_index

function set3( v1, start_index, v2 ) {

    v1[start_index + 0] = v2[0]; 
    v1[start_index + 1] = v2[1]; 
    v1[start_index + 2] = v2[2]; 

}


// get three elts from an array

function get3( v1, start_index ) {
    
    ret = [0,0,0];

    ret[0] = v1[ start_index + 0 ];
    ret[1] = v1[ start_index + 1 ];
    ret[2] = v1[ start_index + 2 ];

    return ret;

}

/**********************************************
*
* functions fo calculating/manipulating the
* big position arrays
*
***********************************************/

// helper for calculating distances between two positions 
// in the big position array

function positionArrayDist( pArray, ia, ib ) {

    var dist = 0;
    var temp = 0;

    temp = pArray[ia + 0] - pArray[ib + 0];
    dist += temp * temp;

    temp = pArray[ia + 1] - pArray[ib + 1];
    dist += temp * temp;

    temp = pArray[ia + 2] - pArray[ib + 2];
    dist += temp * temp;
    

    return Math.sqrt(dist);
}


// calculates normlaized vector between two points in the big position array
// vector going from a to b

function positionArrayNormVector( pArray, ia, ib ) {

    var d = positionArrayDist( pArray, ia, ib );

    var ret = [0,0,0];

    ret[0] = ( pArray[ib + 0] - pArray[ia + 0] ) / d;
    ret[1] = ( pArray[ib + 1] - pArray[ia + 1] ) / d;
    ret[2] = ( pArray[ib + 2] - pArray[ia + 2] ) / d;

    return ret;
    

}


// calculates vector between two points in the big position array
// vector going from a to b

function positionArrayVector( pArray, ia, ib ) {


    var ret = [0,0,0];

    ret[0] =  pArray[ib + 0] - pArray[ia + 0];
    ret[1] =  pArray[ib + 1] - pArray[ia + 1];
    ret[2] =  pArray[ib + 2] - pArray[ia + 2];

    return ret;
    

}


// add two vectors from the big position array


function positionArrayVectorAdd3( pArray, ia, ib ) {

    var ret = [0,0,0];

    ret[0] =  pArray[ib + 0] + pArray[ia + 0];
    ret[1] =  pArray[ib + 1] + pArray[ia + 1];
    ret[2] =  pArray[ib + 2] + pArray[ia + 2]; 


    return ret;

}

// return a normal vector defined by three points
// norm of (p2 - p1) cross (p3 - p1)
// three points in CCW ordering

function normalFromThreePoints( pArray, p1i, p2i, p3i ) {

    var ret = [0,0,0];
   
    var a = positionArrayVector(pArray, p1i*3, p2i*3);
    var b = positionArrayVector(pArray, p1i*3, p3i*3);

    ret = cross3( a, b );
    ret = normalize3( ret );

    return ret;

}


function crossProductThreePoints( pArray, p1i, p2i, p3i ) {

    var ret = [0,0,0];
   
    var a = positionArrayVector(pArray, p1i*3, p2i*3);
    var b = positionArrayVector(pArray, p1i*3, p3i*3);

    ret = cross3( a, b );

    return ret;

} 

// calculate the 
function areaThreePoints( pArray, p1i, p2i, p3i ) {

    var ret = 0;
   
    var a = positionArrayVector(pArray, p1i*3, p2i*3);
    var b = positionArrayVector(pArray, p1i*3, p3i*3);

    var cross = cross3( a, b );
    ret = magnitude3( cross );
    ret = ret / 2;

    return ret;

} 





/*************************************************************8
*
* Math for matrix things ALL ROW MAJOR
*
*************************************************************/


function invert2x2( M ) { 

    var Minv = [ [0,0] , [0,0] ] ;
    
    var a = M[0][0];
    var b = M[0][1];
    var c = M[1][0];
    var d = M[1][1];

    var det = a*d - b*c;

    Minv [0][0] = d / det;
    Minv [0][1] = -1 * b / det;
    Minv [1][0] = -1 * c / det;
    Minv [1][1] = a / det;
    
    return Minv;

}

// square [2x2] * [2x1]

function squareMVmul2( m, v ) {

    var ret = [0, 0];
    
    ret[0] = m[0][0] * v[0] + m[0][1] * v[1]; 
    ret[1] = m[1][0] * v[0] + m[1][1] * v[1]; 

    return ret;

}

// outer product

function outerProd3( v1, v2 ) {

    var ret = [0,0,0,
               0,0,0,
               0,0,0];  // row major 3x3 matrix


    ret[0] = v1[0] * v2[0];
    ret[1] = v1[0] * v2[1];
    ret[2] = v1[0] * v2[2];
    ret[3] = v1[1] * v2[0];
    ret[4] = v1[1] * v2[1];
    ret[5] = v1[1] * v2[2];
    ret[6] = v1[2] * v2[0];
    ret[7] = v1[2] * v2[1];
    ret[8] = v1[2] * v2[2];

    return ret; 


}
    

// trace ( for the strain tensors ) 

function trace3( M ) {


    return ( M[0] + M[4] + M[8] );

}


// matrix multiply [3x3]  * [3x3] 
// matrices stored in 1x9 vector ( row major ) 
// y u do dis

function matmul3( M1, M2 ) {

    var cur = 0;

    var row = 0; // helper indices
    var col = 0; // moah helper indices

    var ret = [ 0,0,0,
                0,0,0,
                0,0,0 ]; 

    for ( var i = 0 ; i < 9 ; i++ ) {

        cur = 0;
        row = Math.floor( i / 3 ); 
        col = i % 3;
        
        cur += M1[ row * 3 + 0 ] * M2[ 0 + col ]; 
        cur += M1[ row * 3 + 1 ] * M2[ 3 + col ]; 
        cur += M1[ row * 3 + 2 ] * M2[ 6 + col ]; 

        ret[i] = cur;  

    }

    return ret;

}


// matrix add two 3x3

function matadd3( M1, M2 ) {


    var ret = [0,0,0,
               0,0,0,
               0,0,0]; 

    ret[0] = M1[0] + M2[0];
    ret[1] = M1[1] + M2[1];
    ret[2] = M1[2] + M2[2];
    ret[3] = M1[3] + M2[3];
    ret[4] = M1[4] + M2[4];
    ret[5] = M1[5] + M2[5];
    ret[6] = M1[6] + M2[6];
    ret[7] = M1[7] + M2[7];
    ret[8] = M1[8] + M2[8];

    return ret;

}

// rotate a vector by 90 degrees clockwise

function rotate90CW( v ) {

    var rotM_r0 = [0,0,1];  // first row
    var rotM_r1 = [0,1,0];  // first row
    var rotM_r2 = [-1,0,0];  // first row


    ret = [0,0,0];
    ret[0] = dot3(rotM_r0,v);
    ret[1] = dot3(rotM_r1,v);
    ret[2] = dot3(rotM_r2,v);

    return  ret; 


}

