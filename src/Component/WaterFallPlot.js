import React, { Component } from 'react';
import * as d3 from 'd3';
import * as moment from 'moment';

import GetDomain from '../Utils/GetDomain.js';
import ReadPLY from '../Utils/ReadPLY.js';
import Axis from './Axis.js';
import AxisBox from './AxisBox.js';

import { csv } from 'd3-request';
import { json } from 'd3-request';
import { text } from 'd3-request';

class WaterFallPlot extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentWillMount() {
    if (this.props.data) {
      switch (this.props.data.fileType) {
        case 'json': {
          json(this.props.data.dataFile, (error, data) => {

            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
        case 'csv': {
          csv(this.props.data.dataFile, (error, data) => {
            data = data.map(d => {
              for (let i = 0; i < this.props.data.fieldDesc.length; i++) {
                if (this.props.data.fieldDesc[i][1] === 'number')
                  d[this.props.data.fieldDesc[i][0]] = +d[this.props.data.fieldDesc[i][0]]
                if ((this.props.data.fieldDesc[i][1] === 'date') || (this.props.data.fieldDesc[i][1] === 'time'))
                  d[this.props.data.fieldDesc[i][0]] = moment(d[this.props.data.fieldDesc[i][0]], this.props.data.fieldDesc[i][2])['_d']
                if (this.props.data.fieldDesc[i][1] === 'jsonObject')
                  d[this.props.data.fieldDesc[i][0]] = JSON.parse(d[this.props.data.fieldDesc[i][0]])
              }
              return d
            })
            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
        case 'ply': {
          let data = ReadPLY(this.props.data.dataFile);
          this.setState({
            data: data,
          })
          break;
        }
        case 'text': {
          text(this.props.data.dataFile, (error, text) => {

            let data = d3.csvParseRows(text).map(function (row) {
              return row.map(function (value) {
                return +value;
              });
            });
            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
        default: {
          let data = this.props.data.dataFile
          this.setState({
            data: data,
          });
          break;
        }
      }
    } else {
      this.setState({
        data: 'NA',
      });
    }
  }

  render() {
    if (!this.state.data) {
      return <a-entity />
    }
    else {
      // Getting domain for axis
      let xDomain, yDomain, zDomain, zDomainTemp;
      if (this.props.mark.position.x) {
        if (!this.props.mark.position.x.domain) {
          xDomain = [];
          Object.keys(this.state.data[0]).forEach((d,i) => {
            if(d !== this.props.mark.position.z.field){
              xDomain.push(d)
            }
          })
        } 
        else 
          xDomain = this.props.mark.position.x.domain;
      }
      
      if (this.props.mark.position.z) {
        if (this.props.mark.position.z.scaleType === 'linear') {
          if (!this.props.mark.position.z.domain) {
            zDomainTemp = this.state.data.map((d, i) => parseFloat(d[this.props.mark.position.z.field]));
            zDomain = [Math.min(...zDomainTemp), Math.max(...zDomainTemp)];
          } else {
            zDomain = this.props.mark.position.z.domain;
            zDomainTemp = this.props.mark.position.z.domain;
          }
        }
        else{
          zDomain = GetDomain(this.state.data, this.props.mark.position.z.field, this.props.mark.position.z.scaleType, false)
          zDomainTemp = GetDomain(this.state.data, this.props.mark.position.z.field, this.props.mark.position.z.scaleType, false)
        }
      }

      if (this.props.mark.position.y) {
        if (!this.props.mark.position.y.domain) {
          let min = 9999999999999999, max = -99999999999999999;
          for (let k = 0; k < xDomain.length; k++) {
            for (let i = 0; i < this.state.data.length; i++) {
              if (min > this.state.data[i][xDomain[k]]) {
                min = this.state.data[i][xDomain[k]]
              }
              if (max < this.state.data[i][xDomain[k]])
                max = this.state.data[i][xDomain[k]]
            }
          }
          if (this.props.mark.position.y.startFromZero)
            yDomain = [0, max]
          else
            yDomain = [min, max]
        } else
          yDomain = this.props.mark.position.y.domain
      }

      //Adding Scale
      let zRange = [];
      for (let i = 0; i < zDomain.length; i++) {
        zRange.push(i * this.props.style.dimensions.depth / (zDomain.length - 1))
      }
      let xRange = [];
      for (let i = 0; i < xDomain.length; i++) {
        xRange.push(i * this.props.style.dimensions.width / (xDomain.length - 1))
      }

      let xScale, yScale, zScale;

      if (this.props.mark.position.x.scaleType === 'ordinal')
        xScale = d3.scaleOrdinal()
          .range(xRange)
          .domain(xDomain);
      else
        xScale = d3.scaleLinear()
          .range([0, this.props.style.dimensions.width])
          .domain(xDomain);
      yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([0, this.props.style.dimensions.height])

      if (this.props.mark.position.z.scaleType === 'ordinal')
        zScale = d3.scaleOrdinal()
          .domain(zDomain)
          .range(zRange);
      else
        zScale = d3.scaleLinear()
          .domain(zDomain)
          .range([0, this.props.style.dimensions.depth]);

      let strokeColorScale, strokeColorDomain = this.props.mark.position.z.field;

      if (this.props.mark.style.stroke)
        if (this.props.mark.style.stroke.scaleType) {
          if (!this.props.mark.style.stroke.domain) {
            strokeColorDomain = GetDomain(this.state.data, this.props.mark.style.stroke.field, this.props.mark.style.stroke.scaleType, this.props.mark.style.stroke.startFromZero)
          } else
            strokeColorDomain = this.props.mark.style.stroke.domain
          let strokeColorRange = d3.schemeCategory10;
          if (this.props.mark.style.stroke.color)
            strokeColorRange = this.props.mark.style.stroke.color;
          if (this.props.mark.style.stroke.scaleType === 'ordinal')
            strokeColorScale = d3.scaleOrdinal()
              .domain(strokeColorDomain)
              .range(strokeColorRange)
          else {
            strokeColorScale = d3.scaleLinear()
              .domain(strokeColorDomain)
              .range(strokeColorRange)
          }
        }


      let fillColorScale, fillColorDomain = this.props.mark.position.z.field;

      if (this.props.mark.style.fill)
        if (this.props.mark.style.fill.scaleType) {
          if (!this.props.mark.style.fill.domain) {
            fillColorDomain = GetDomain(this.state.data, this.props.mark.style.fill.field, this.props.mark.style.fill.scaleType, this.props.mark.style.fill.startFromZero)
          } else
            fillColorDomain = this.props.mark.style.fill.domain
          let fillColorRange = d3.schemeCategory10;
          if (this.props.mark.style.fill.color)
            fillColorRange = this.props.mark.style.fill.color;
          if (this.props.mark.style.fill.scaleType === 'ordinal')
            fillColorScale = d3.scaleOrdinal()
              .domain(fillColorDomain)
              .range(fillColorRange)
          else {
            fillColorScale = d3.scaleLinear()
              .domain(fillColorDomain)
              .range(fillColorRange)
          }
        }

      //Axis
      let xAxis, yAxis, zAxis;

      if (this.props.xAxis) {
        xAxis = <Axis
          domain={xDomain}
          tick={this.props.xAxis.ticks}
          scale={xScale}
          axis={'x'}
          orient={this.props.xAxis.orient}
          title={this.props.xAxis.title}
          dimensions={this.props.style.dimensions}
          scaleType={this.props.mark.position.x.scaleType}
          grid={this.props.xAxis.grid}
        />
      }

      if (this.props.yAxis) {
        yAxis = <Axis
          domain={yScale.ticks(this.props.yAxis.ticks['noOfTicks'])}
          tick={this.props.yAxis.ticks}
          scale={yScale}
          axis={'y'}
          orient={this.props.yAxis.orient}
          title={this.props.yAxis.title}
          dimensions={this.props.style.dimensions}
          scaleType={this.props.mark.position.y.scaleType}
          grid={this.props.yAxis.grid}
        />
      }

      if (this.props.zAxis) {
        zAxis = <Axis
          domain={zDomain}
          tick={this.props.zAxis.ticks}
          scale={zScale}
          axis={'z'}
          orient={this.props.zAxis.orient}
          title={this.props.zAxis.title}
          dimensions={this.props.style.dimensions}
          scaleType={this.props.mark.position.z.scaleType}
          grid={this.props.zAxis.grid}
        />

      }

      let box;
      if (this.props.axisBox) {
        box = <AxisBox
          width={this.props.style.dimensions.width}
          height={this.props.style.dimensions.height}
          depth={this.props.style.dimensions.depth}
          color={this.props.axisBox.color}
        />
      }

      //Adding marks
      let marks, resolution = 20;

      if(this.props.mark.style.stroke.resolution)
        resolution = this.props.mark.style.stroke.resolution

      marks = this.state.data.map((d, i) => {
        let mapShape, mapOutline
        let path = `0 0,`
        for (let j = 0; j < xDomain.length; j++) {
          if (j !== xDomain.length - 1)
            path = path + ` ${xScale(xDomain[j])} ${yScale(d[xDomain[j].toString()])},`
          else
            path = path + ` ${xScale(xDomain[j])} ${yScale(d[xDomain[j].toString()])}`
        }
        path = path + `, ${xScale(xDomain[xDomain.length - 1])} 0`
        let points = path.split(', ')
        let pntArray = points.map(el => {
          let pnts = el.split(' ') 
          let obj = {'x':pnts[0],'y':pnts[1], 'z':`${zScale(d[this.props.mark.position.z.field])}`}
          return obj
        })
        let outlineArray = []
        pntArray.forEach((el,i) => {
          if(i !== 0 && i !== pntArray.length - 1)
            outlineArray.push(el)
        })
        if (this.props.mark.style.fill)
          if(this.props.mark.style.fill.scaleType) 
            mapShape = <a-frame-shape points={JSON.stringify(pntArray)} key={i} color={fillColorScale(d[this.props.mark.style.fill.field])} opacity={this.props.mark.style.fill.opacity} /> 
          else
            mapShape = <a-frame-shape points={JSON.stringify(pntArray)} key={i} color={this.props.mark.style.fill.color} opacity={this.props.mark.style.fill.opacity} />
        
        if (this.props.mark.style.stroke){
          if(this.props.mark.style.stroke.scaleType){
            mapOutline = <a-frame-curve-line points={JSON.stringify(outlineArray)} type={this.props.mark.style.stroke.curveType} resolution={resolution} color={strokeColorScale(d[this.props.mark.style.stroke.field])} opacity={1} stroke_width={this.props.mark.style.stroke.width} />
          }
          else
            mapOutline = <a-frame-curve-line points={JSON.stringify(outlineArray)} type={this.props.mark.style.stroke.curveType} resolution={resolution} color={this.props.mark.style.stroke.color} opacity={1} stroke_width={this.props.mark.style.stroke.width} />
        }
        return (
          <a-entity  key={i} >
            {mapOutline}
            <a-entity position={`0 0 ${zScale(d[this.props.mark.position.z.field])}`} >
              {mapShape} 
            </a-entity>
          </a-entity>
        )

      })

      let  clickRotation = 'false',animation;
      if(this.props.rotationOnDrag)
        clickRotation = 'true'
      if(this.props.animateRotation){
        clickRotation='false'
        animation  = <a-animation
            attribute="rotation"
            easing="linear"
            dur={`${this.props.animateRotation.duration}`}
            from={this.props.animateRotation.initialAngles}
            to={this.props.animateRotation.finalAngles}
            repeat="indefinite"
          />
      }
      return (
        <a-entity click-rotation={`enabled:${clickRotation}`} pivot-center={`xPosition:${this.props.style.origin[0]};yPosition:${this.props.style.origin[1]};zPosition:${this.props.style.origin[2]};pivotX:${this.props.style.xPivot};pivotY:${this.props.style.yPivot};pivotZ:${this.props.style.zPivot}`}  position={`${this.props.style.origin[0]} ${this.props.style.origin[1]} ${this.props.style.origin[2]} `} rotation={this.props.style.rotation} id={this.props.index}>
          {animation}
          {xAxis}
          {yAxis}
          {zAxis}
          {box}
          {marks}
          <a-box class='clickable' width={this.props.style.dimensions.width} height={this.props.style.dimensions.height} depth={this.props.style.dimensions.depth} position={`${this.props.style.dimensions.width / 2} ${this.props.style.dimensions.height / 2} ${this.props.style.dimensions.depth / 2}`} opacity ={0}/>
        </a-entity>
      )
    }
  }
}
export default WaterFallPlot