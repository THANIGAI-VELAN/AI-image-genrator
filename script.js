const promptBtn = document.querySelector('.prompt-btn');
const promptInput = document.querySelector('.prompt-input');
const promptForm = document.querySelector('.prompt-form');
const modelSelect = document.getElementById('model-select');
const countSelect = document.getElementById('count-select');
const ratioSelect = document.getElementById('ratio-select');
const galleryGrid = document.querySelector('.gallery-grid');
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

// Toggle theme function
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const icon = document.querySelector('.theme-toggle i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
}

// Random prompt function
function randomPrompt() {
  const prompt = Math.floor(Math.random() * examplePrompts.length);
  promptInput.value = examplePrompts[prompt];
  promptInput.focus();
}

// Model mapping for Together API
const modelMap = {
  "style1": "black-forest-labs/FLUX.1-dev",
  "style2": "black-forest-labs/FLUX.2-dev",
  "style3": "black-forest-labs/FLUX.3-dev"
};

// Your Hugging Face API key here:
const HF_API_KEY = ""; // <-- Replace with your real API key

promptForm.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(e) {
  e.preventDefault();

  // Get user selections
  const promptText = promptInput.value.trim();
  const modelKey = modelSelect.value;
  const model = modelMap[modelKey] || "black-forest-labs/FLUX.1-dev";
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";

  // Prepare gallery for loading
  const imgCards = galleryGrid.querySelectorAll('.img-card');
  imgCards.forEach((card, idx) => {
    if (idx < imageCount) {
      card.classList.add('loading');
      card.querySelector('.status-text').textContent = "Generating";
      card.querySelector('.gallery-image').src = "test.png";
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });

  // Generate images
  for (let i = 0; i < imageCount; i++) {
    try {
      const imgURL = await generateImage(promptText, model, aspectRatio);
      imgCards[i].querySelector('.gallery-image').src = imgURL;
      imgCards[i].classList.remove('loading');
      imgCards[i].style.display = "";
    } catch (err) {
      imgCards[i].querySelector('.status-text').textContent = "Error";
      imgCards[i].classList.remove('loading');
      imgCards[i].style.display = "";
      alert("Image generation failed. Please try again.");
    }
  }
}

// Function to call Hugging Face Together API and get image as base64
async function generateImage(prompt, model, aspectRatio) {
  const response = await fetch(
    "https://router.huggingface.co/together/v1/images/generations",
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        response_format: "base64",
        model: model
        // You can add width/height here if your model supports it
      }),
    }
  );
  if (!response.ok) throw new Error("API Error");
  const result = await response.json();
  const base64 = result.generations[0].image;
  return `data:image/png;base64,${base64}`;
}

// Download button functionality
galleryGrid.addEventListener('click', function(e) {
  if (e.target.closest('.download-btn')) {
    const img = e.target.closest('.img-card').querySelector('.gallery-image');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = "generated-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});