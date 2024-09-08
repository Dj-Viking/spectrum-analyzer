# Spectrum Analyzer
<p class="statement">Makes use of the web audio API to take microphone input signal as a source.</p>
<p class="statement">as well as the built-in <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode" rel="noopener noreferrer">AnalyserNode</a> interface from the web audio API.</p>
<br/>
<p class="statement">The FFT information taken from the 'analyserNode.<a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData" rel="noopener noreferrer">getFloatFrequencyData</a>(*Float32Array arr)'.</p>
<br/>
<p class="statement">The buffer the user creates to store the sample data is allocated on each draw frame of the <code>canvas</code> element.</p>
<br />
<p class="statement">Then the data is parsed to <a href="https://github.com/Dj-Viking/spectrum-analyzer/blob/5c926d5c390218178b07272bd87803abc12a4aa5/app/app.mts#L78" rel="noopener noreferrer">get some meaningful information</a> on how to adjust the geometry of some part of the canvas.</p>
<br/>
<p class="statement">And also in this example, the HSL color scheme by frequency amplitude as well as frequency domain (lows, mids, highs).</p>

<br/>
<img src="./spect-gif.gif"/>
