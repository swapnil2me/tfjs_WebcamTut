import * as tf from '@tensorflow/tfjs';
// import logo from './ModiandI.jpg';
import React, { useState, useRef } from 'react';
import * as d3 from 'd3';
import './App.css';

var model, webcamElement, webcam, img, predictions;

var facemesh = require('@tensorflow-models/facemesh');

async function loadFacenet() {
  model = await facemesh.load();
  console.log("Facenet Loaded");
  webcamElement = document.getElementById('webcam');
  webcam = await tf.data.webcam(webcamElement);

};
loadFacenet();

// var line = d3.line()
//          .x(function(d,i){return d.x;})
//          .y(function(d,i){return d.y;})
//          .curve(d3.curveLinear);

function App() {

  const [timeseriesMode, setTimeseriesMode] = useState(false);
  const [interval, setstoreInterval] = useState('');

  let j = 0;
  const svgRef = useRef();

  const handleClick = () => {
    setTimeseriesMode(!timeseriesMode);
    console.log('timeseriesMode ::', timeseriesMode);
    if (!timeseriesMode) {
      const interval = setInterval(main, 1000);
      setstoreInterval(interval);
      console.log("swap");
    }
    if (timeseriesMode) {
      clearInterval(interval);
    }
  }

  async function main() {
    console.log('mainmainmainmain');
    var svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
    // array of detected faces from the MediaPipe graph.

    img = await webcam.capture();
    predictions = await model.estimateFaces(img);
    // const predictions = await model.estimateFaces(document.getElementById('face'));
    for (let i = 0; i < predictions.length; i++) {

      // let pointVector = predictions[i].mesh;
      //
      // let arrayOfArrays = pointVector;
      //
      // let pntSum = arrayOfArrays.reduce(function(array1, array2) {
      //     return array1.map(function(value, index) {
      //       return value + array2[index];
      //     });
      //   });

      // let noseTip = predictions[i].annotations['noseTip'];

      // console.log(pntSum);

      let features = ['leftEyeLower0',
        'leftEyeUpper0',
        'rightEyeLower0',
        'rightEyeUpper0',
        'lipsLowerInner', 'lipsLowerOuter', 'lipsUpperInner', 'lipsUpperOuter'
      ]

      // console.log(predictions[i].annotations);
      for (var k = 0; k < features.length; k++) {
        const keypoints = predictions[i].annotations[features[k]];
        if (keypoints.length > 0) {
          let xOffset = -35;
          let yOffset = 45;
          var dataArray = keypoints.map((e, l) => {
            return { x: 0.8 * e[0] + xOffset, y: 0.75 * e[1] + yOffset };
          });


          svg.append("g").attr("class", "fuel")
            .selectAll("circle")
            .data(dataArray)
            .enter().append("circle")
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("fill", "yellow")
            .attr("r", "1.0");
        }

      }
      // svg.append("path")
      //   .attr("fill","none")
      //   .attr("stroke","red")
      //   .attr("stroke-width",'2')
      //   .attr("d",line([{x:0,y:0},{x:noseTip[0][0],y:noseTip[0][2]}]));

      // console.log(dataArray);
      // console.log(noseTip[0][2]);
      // console.log();
      console.log(j++);
    }

    img.dispose();
    await tf.nextFrame();

    // if (predictions.length > 0) {
    //   for (let i = 0; i < predictions.length; i++) {
    //     const keypoints = predictions[i].scaledMesh;
    //
    //     // Log facial keypoints.
    //     for (let i = 0; i < keypoints.length; i++) {
    //       const [x, y, z] = keypoints[i];
    //
    //       console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
    //     }
    //   }
    // }

  }

  return (
    <div className="App">
      <button onClick={() => loadFacenet()} >Init</button>
      <button onClick={() => main()} >Find Face Once</button>
      <button onClick={handleClick}>
        Continuous Mode: {timeseriesMode ? 'True' : 'False'}
      </button>

      <header className="App-header">
        <div id="videoContainer" className="container">
          <video autoPlay playsInline muted id="webcam" width="448" height="448" className="centered"></video>
          <svg ref={svgRef} className="centered" width="448" height="448" />
        </div>
      </header>
    </div>
  );
}

export default App;
