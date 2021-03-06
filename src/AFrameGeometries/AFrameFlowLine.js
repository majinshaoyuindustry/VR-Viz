import * as THREE from 'three';
import AFRAME from 'aframe';

AFRAME.registerPrimitive('a-frame-flowLine', {
  defaultComponents: {
    curvefrompoints: {},
  },

  mappings: {
    points: 'curvefrompoints.points',
    opacity: 'curvefrompoints.opacity',
    color: 'curvefrompoints.color',
    strokewidth: 'curvefrompoints.strokewidth',
    resolution: 'curvefrompoints.resolution',
    curviness:'curvefrompoints.curviness'
  }
});

AFRAME.registerComponent("curvefrompoints", {
  schema: {
    points:{type:'string',default:'[]'},
    color:{type:'string',default:'[]'},
    strokewidth:{type:'number',default:1},
    opacity:{type:'number',default:1},
    resolution:{type:'number',default:500},
    curviness:{type:'number',default: 0.5}
  },
  init: function() {
    function getPointInBetweenByPerc(pointA, pointB, percentage) {
      let dir = pointB.clone().sub(pointA);
      let len = dir.length();
      dir = dir.normalize().multiplyScalar(len*percentage);
      return pointA.clone().add(dir);
    }
    this.obj = this.el;
    this.model = this.el.object3D;
    let material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      linewidth: this.data.strokewidth,
      opacity:this.data.opacity,
      transparent: true,
      linecap: 'round', //ignored by WebGLRenderer
      linejoin:  'round' //ignored by WebGLRenderer
    });
    let dataPoints = JSON.parse(this.data.points)
    let colorPoints = JSON.parse(this.data.color)
    let bufferGeomArray = dataPoints.map((d,j) => {
      let pointVecs = []
      for(let  i = 0; i < d.length; i++){
        let vec = new THREE.Vector3( parseFloat(d[i].x), parseFloat(d[i].y), parseFloat(d[i].z) )
        pointVecs.push(vec)
      }
      let curve, points
      let pointset1 = getPointInBetweenByPerc(pointVecs[0],pointVecs[1],this.data.curviness)
      let pointset2 = getPointInBetweenByPerc(pointVecs[1],pointVecs[2],1 - this.data.curviness)
      pointset1.z = pointVecs[1].z
      pointset2.z = pointVecs[1].z
      curve = new THREE.QuadraticBezierCurve3( pointVecs[0],pointset1,pointVecs[1] );
      points = curve.getPoints( this.data.resolution );
      let curve1 = new THREE.QuadraticBezierCurve3( pointVecs[1],pointset2,pointVecs[2] );
      let points1 = curve1.getPoints( this.data.resolution );
  
      points1.forEach(el => {
        points.push(el)
      })
      let lineSegmentPoints = [], vertexColor = []
      points.forEach((el,i) => {
        if(i === 0 || i === points.length - 1){
          lineSegmentPoints.push(el)
          vertexColor.push(new THREE.Color( colorPoints[j] ))
        } else {
          lineSegmentPoints.push(el)
          lineSegmentPoints.push(el)
          vertexColor.push(new THREE.Color( colorPoints[j] ))
          vertexColor.push(new THREE.Color( colorPoints[j] ))
        }
      })
      let bufferGeom = new THREE.Geometry()

      bufferGeom.vertices  = lineSegmentPoints;
      bufferGeom.colors = vertexColor
      return bufferGeom
    })
    let geoMerge = new THREE.Geometry()
    bufferGeomArray.forEach((d,i) => {
      geoMerge.merge(d);
    })

    //coverting merged geometry to buffergeometry
    let geoMergeBuffer = new THREE.BufferGeometry();
    let strokeVer = [], colors = []
    for(let  i = 0; i < geoMerge.vertices.length; i++){
      strokeVer.push(parseFloat(geoMerge.vertices[i].x),parseFloat(geoMerge.vertices[i].y),parseFloat(geoMerge.vertices[i].z))
      colors.push( geoMerge.colors[i].r, geoMerge.colors[i].g, geoMerge.colors[i].b)
    }
    let strokeVerFloat = new Float32Array(strokeVer)
    let colorsFloat = new Float32Array(colors)
    geoMergeBuffer.addAttribute( 'position', new THREE.BufferAttribute( strokeVerFloat, 3 ) );
    geoMergeBuffer.addAttribute( 'color', new THREE.BufferAttribute( colorsFloat, 3 ) );
    
    let curveObject;
    let obj = new AFRAME.THREE.Object3D()
    curveObject = new THREE.LineSegments( geoMergeBuffer, material )
    obj.add(curveObject)
    this.el.setObject3D('mesh',obj);
  }
});