import * as tf from '@tensorflow/tfjs';
// import logo from './ModiandI.jpg';
import React, {useState, useRef} from 'react';
import * as d3 from 'd3';
import './App.css';

var model,webcamElement,webcam,img,predictions;
var facemesh = require('@tensorflow-models/facemesh');

async function loadFacenet() {
        model = await facemesh.load();
        console.log("Facenet Loaded");
         webcamElement = document.getElementById('webcam');
         webcam = await tf.data.webcam(webcamElement);
         img = await webcam.capture();
      };

var line = d3.line()
         .x(function(d,i){return d.x;})
         .y(function(d,i){return d.y;})
         .curve(d3.curveStep);

function App() {

  const [timeseriesMode, setTimeseriesMode] = useState(false);

  let j = 0;
  const svgRef = useRef();

  async function main() {

    var svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
    // array of detected faces from the MediaPipe graph.

    img = await webcam.capture();
    predictions = await model.estimateFaces(img);
    // const predictions = await model.estimateFaces(document.getElementById('face'));
    for (let i = 0; i < predictions.length; i++) {

    let br = predictions[i].boundingBox.bottomRight[0];
    let tl = predictions[i].boundingBox.topLeft[0];
    var dataArray = [{x:tl[0],y:br[1]},
                   {x:tl[0],y:tl[1]},
                   {x:br[0],y:tl[1]},
                   {x:br[0],y:br[1]},
                   {x:tl[0],y:br[1]}];
    svg.append("path")
      .attr("fill","none")
      .attr("stroke","yellow")
      .attr("d",line(dataArray));
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
      <button onClick={(event)=>{
                        setTimeseriesMode(!timeseriesMode);
                        clearInterval(main);
                        if (timeseriesMode) {
                          setInterval(main, 1000);
                          console.log("swap");
                        }
                      }}>
      Continuous Mode: {timeseriesMode ? 'True' : 'False'}
      </button>

      <header className="App-header">
        <div id="videoContainer" className="container">
          <video autoPlay playsInline muted id="webcam" width="224" height="224" className="centered"></video>
          <svg ref={svgRef} className="centered" width="224" height="224"/>
        </div>
      </header>
    </div>
  );
}

export default App;
