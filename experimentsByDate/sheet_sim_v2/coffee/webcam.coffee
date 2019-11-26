# HeatCamera Interface
# ---------------------
# Access camera feed
# Solve homography
# Convert pixel values to thermal values[

$ ->
  window.hc = new HeatCamera
    container: $('#video-wrapper')
  hc.open()
  console.log "LOADED"

class Camera
  constructor: (ops) ->
    _.extend this, ops
    @localMediaStream = null
    @navigator = window.navigator
    @errorCallback = (e) ->
      console.log 'Permission Denied', e
    @init()
  init: ->
    @w = @container.width()
    @h = @container.height()
    @video = $('<video></video>').addClass('webcam-video webcam visible').attr
      autoplay: 'autoplay'
    @canvas = $('<canvas></canvas>').addClass('webcam-canvas webcam').css(display: 'none').attr   
    @container.append [@video]
  open: ->
    scope = this
    @navigator.getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia or navigator.msGetUserMedia
    scope.navigator.getUserMedia { video: true }, ((stream) ->
      scope.video.attr('src', window.URL.createObjectURL(stream))
      scope.localMediaStream = stream
    ), @errorCallback
    @_rectification_routine()
  capture: ->
    if !@localMediaStream then return
    # @ctx.drawImage @video, 0, 0, @w, @h
    # process = setInterval(function(){w.frame()}, 30);
    # imageData = @ctx.getImageData(0, 0, @w, @h)
    # origPixels = new Uint8ClampedArray(imageData.data)
  close: ->
  
  _rectification_routine: ->
    # PROMPT FOUR POINTS
    d = {1:{x:1, y:2}, 2:{x:1, y:2}, 3:{x:1, y:2}, 4:{x:1, y:2}}
    s = {1:{x:1, y:2}, 2:{x:1, y:2}, 3:{x:1, y:2}, 4:{x:1, y:2}}
    # SOLVE HOMOGRAPHY
    system_of_eq = [ 
      [s[1].x, s[1].y, 0, 0, 0, -1 * s[1].x * d[1].x, -1 * s[1].y * d[1].x]
      [0, 0, 0, s[1].x, s[1].y, 1, -1 * s[1].x * d[1].y, -1 * s[1].y * d[1].y]
      [s[2].x, s[2].y, 0, 0, 0, -1 * s[2].x * d[2].x, -1 * s[2].y * d[2].x]
      [0, 0, 0, s[2].x, s[2].y, 1, -1 * s[2].x * d[2].y, -1 * s[2].y * d[2].y]
      [s[3].x, s[3].y, 0, 0, 0, -1 * s[3].x * d[3].x, -1 * s[3].y * d[3].x]
      [0, 0, 0, s[3].x, s[3].y, 1, -1 * s[3].x * d[3].y, -1 * s[3].y * d[3].y]
      [s[4].x, s[4].y, 0, 0, 0, -1 * s[4].x * d[4].x, -1 * s[4].y * d[4].x]
      [0, 0, 0, s[4].x, s[4].y, 1, -1 * s[4].x * d[4].y, -1 * s[4].y * d[4].y]
    ]

          # APPLY TRANSFORM
  


class window.HeatCamera extends Camera
  to_heat: ->
    # RETURN A MATRIX OF HEAT VALUES with FLOAT PRECISION


  
    