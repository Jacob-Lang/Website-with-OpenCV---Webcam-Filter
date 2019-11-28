// Get the video feed from the webcam

let video = document.getElementById("videoInput"); // video is the id of video tag
video.style.display = "none";  // this prevents the webcam raw feed from playing on the website
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred! " + err);
    });

// Set up a canvas frame where we will edit the image
let canvasFrame = document.getElementById("canvasFrame"); // canvasFrame is the id of <canvas>
let context = canvasFrame.getContext("2d");
canvasFrame.style.display = "none";  // Again we prevent this video from playing (we only want the final image to play on screen)


cv['onRuntimeInitialized']=()=>{  // This waits til cv is really loaded

  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);  // empty matrix to fill with image data
  let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);  // empty matrix to fill with filtered image
  let dst2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);  // empty matrix to fill with filtered image

  // colour pallette
  const colours = [[255,0,0],[0,255,0],[0,0,255],[0,255,255],[255,0,255],[255,255,0]]

  blk = src.clone(); //Clone from the original image
  blk.setTo(new cv.Scalar(0,0,0,255)); //Sets as a black screen

  const FPS = 30;                 // FPS of edge image
  const store_delay = 2;          // seconds
  const n_stored = 3;             // number of frames to store
  var frameStore = Array(n_stored).fill(blk.clone())   // store array
  var frameCount = 0    // start from one so that colour doesnt change on first go.
  var storeCount = 0

  function processVideo() {

      let begin = Date.now();  // get time

      context.drawImage(video, 0, 0, video.width, video.height);  //  copy input video to canvas then src
      src.data.set(context.getImageData(0, 0, video.width, video.height).data);

      // reset blank screen and empty edges
      blk = src.clone(); //Clone from the original image
      blk.setTo(new cv.Scalar(0,0,0,255)); //This sets the whole image to white, it is R,G,B value
      edges = blk.clone(); //Clone from the original image

      // filtering
      cv.Canny(src, dst, 100, 200)
      let clr = new cv.Scalar(...colours[storeCount%colours.length], 255)
      edges.setTo(clr, dst);

      // store frames
      if((frameCount/FPS)%store_delay == 0){
        frameStore.shift()
        frameStore.push(edges.clone())
        storeCount+=1
      }

      // mix images
      sum = edges.clone()
      for(let n=0; n < frameStore.length; n++){
        cv.max(sum, frameStore[n], sum)
      }

      // print to screen
      cv.imshow("videoOutput", sum); // canvasOutput is the id of another <canvas>;

      // schedule next one.
      frameCount += 1
      let delay = 1000/FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
  }

  // schedule first one.
  setTimeout(processVideo, 0);
}
