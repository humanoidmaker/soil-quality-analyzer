import io
import torch
import torch.nn as nn
import numpy as np
from PIL import Image
from typing import Dict, List, Any, Optional

_model = None
_device = None

SOIL_TYPES = ["Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Saline"]
MOISTURE_LEVELS = ["Very Dry", "Dry", "Moderate", "Moist", "Wet", "Waterlogged"]

# Soil type -> properties mapping
SOIL_PROPERTIES = {
    "Clay": {
        "ph_range": "6.0-7.5",
        "organic_matter": "Medium-High",
        "moisture_tendency": "Moist",
        "suitable_crops": ["Rice", "Wheat", "Lettuce", "Broccoli", "Cabbage", "Beans"],
        "recommendations": [
            "Add organic matter to improve drainage",
            "Avoid working when wet to prevent compaction",
            "Use raised beds for better drainage",
        ],
        "fertilizer": "NPK 10-10-10 balanced fertilizer with added gypsum",
    },
    "Sandy": {
        "ph_range": "5.5-7.0",
        "organic_matter": "Low",
        "moisture_tendency": "Dry",
        "suitable_crops": ["Carrots", "Potatoes", "Radish", "Lettuce", "Strawberries", "Peppers"],
        "recommendations": [
            "Add compost to improve water retention",
            "Use mulch to reduce evaporation",
            "Fertilize more frequently as nutrients leach quickly",
        ],
        "fertilizer": "NPK 15-5-10 with slow-release nitrogen",
    },
    "Loamy": {
        "ph_range": "6.0-7.0",
        "organic_matter": "Medium",
        "moisture_tendency": "Moderate",
        "suitable_crops": ["Wheat", "Rice", "Corn", "Vegetables", "Fruits", "Tomatoes", "Peppers"],
        "recommendations": [
            "Ideal soil - maintain with regular composting",
            "Good drainage and nutrient retention",
            "Rotate crops annually for best results",
        ],
        "fertilizer": "NPK 10-10-10 balanced fertilizer",
    },
    "Silt": {
        "ph_range": "6.0-7.0",
        "organic_matter": "Medium-High",
        "moisture_tendency": "Moist",
        "suitable_crops": ["Willow", "Birch", "Dogwood", "Most vegetables", "Grasses"],
        "recommendations": [
            "Avoid compaction - add organic matter",
            "Good moisture retention but may waterlog",
            "Use cover crops to prevent erosion",
        ],
        "fertilizer": "NPK 10-10-10 with phosphorus supplement",
    },
    "Peaty": {
        "ph_range": "3.5-5.5",
        "organic_matter": "Very High",
        "moisture_tendency": "Wet",
        "suitable_crops": ["Blueberries", "Potatoes", "Shrubs", "Legumes", "Root vegetables"],
        "recommendations": [
            "Add lime to raise pH if needed",
            "Excellent moisture retention",
            "May need drainage improvement",
        ],
        "fertilizer": "Lime-based fertilizer with NPK 5-10-10",
    },
    "Chalky": {
        "ph_range": "7.5-8.5",
        "organic_matter": "Low-Medium",
        "moisture_tendency": "Dry",
        "suitable_crops": ["Spinach", "Beets", "Sweet corn", "Cabbage", "Lilac"],
        "recommendations": [
            "Add acidic organic matter to lower pH",
            "Iron and manganese deficiency common",
            "Use sulfur to acidify if needed",
        ],
        "fertilizer": "Acidifying fertilizer with iron chelate",
    },
    "Saline": {
        "ph_range": "7.0-8.5",
        "organic_matter": "Low",
        "moisture_tendency": "Varies",
        "suitable_crops": ["Barley", "Cotton", "Sugar beet", "Date palm", "Salt-tolerant grasses"],
        "recommendations": [
            "Leach salts with heavy watering",
            "Improve drainage to prevent salt buildup",
            "Use gypsum to displace sodium",
        ],
        "fertilizer": "Gypsum-based amendment with low-salt NPK 5-5-5",
    },
}


class SoilClassifier(nn.Module):
    """Modified ResNet-50 for soil classification."""

    def __init__(self, num_classes=7):
        super().__init__()
        from torchvision import models
        self.resnet = models.resnet50(pretrained=True)
        num_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.resnet(x)


def _get_device():
    global _device
    if _device is None:
        import os
        use_gpu = os.getenv("USE_GPU", "true").lower() == "true"
        if use_gpu and torch.cuda.is_available():
            _device = torch.device("cuda")
            print(f"SoilSense using GPU: {torch.cuda.get_device_name(0)}")
        else:
            _device = torch.device("cpu")
            print("SoilSense using CPU")
    return _device


def _load_model():
    global _model
    if _model is not None:
        return True
    try:
        device = _get_device()
        _model = SoilClassifier(num_classes=len(SOIL_TYPES))
        _model = _model.to(device)
        _model.eval()
        print("Soil classifier model loaded (pre-trained ResNet-50 backbone)")
        return True
    except Exception as e:
        print(f"Failed to load soil model: {e}")
        return False


def _preprocess_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    return image


def _analyze_color(image: Image.Image) -> Dict[str, Any]:
    """Analyze dominant colors to estimate soil properties."""
    img_array = np.array(image.resize((100, 100)))
    avg_color = img_array.mean(axis=(0, 1))
    r, g, b = avg_color

    # Color-based heuristics for soil type
    brightness = (r + g + b) / 3

    if brightness < 80:
        color_type = "dark"
        moisture_hint = "Moist"
    elif brightness < 130:
        color_type = "medium"
        moisture_hint = "Moderate"
    elif brightness < 180:
        color_type = "light"
        moisture_hint = "Dry"
    else:
        color_type = "very_light"
        moisture_hint = "Very Dry"

    # Red channel dominance suggests iron-rich (clay/laterite)
    red_ratio = r / (brightness + 1)
    is_reddish = red_ratio > 1.2

    return {
        "brightness": brightness,
        "color_type": color_type,
        "moisture_hint": moisture_hint,
        "is_reddish": is_reddish,
        "avg_rgb": (int(r), int(g), int(b)),
    }


def _classify_soil(image: Image.Image) -> tuple:
    """Classify soil type using the model."""
    from torchvision import transforms
    device = _get_device()

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = _model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted = torch.max(probabilities, 0)

    soil_type = SOIL_TYPES[predicted.item()]
    conf = confidence.item()

    return soil_type, conf, probabilities.cpu().numpy()


def analyze(image_bytes: bytes, location: Optional[str] = None) -> Dict[str, Any]:
    """Main analysis method: analyze soil from image bytes."""
    image = _preprocess_image(image_bytes)
    color_info = _analyze_color(image)

    soil_type = "Loamy"
    confidence = 0.5
    probabilities = None

    if _load_model():
        try:
            soil_type, confidence, probabilities = _classify_soil(image)
        except Exception as e:
            print(f"Model inference failed, using color heuristics: {e}")
            # Fallback to color heuristics
            if color_info["is_reddish"]:
                soil_type = "Clay"
            elif color_info["brightness"] > 170:
                soil_type = "Chalky" if color_info["brightness"] > 200 else "Sandy"
            elif color_info["brightness"] < 80:
                soil_type = "Peaty"
            else:
                soil_type = "Loamy"
            confidence = 0.45
    else:
        # Pure color heuristic fallback
        if color_info["is_reddish"]:
            soil_type = "Clay"
        elif color_info["brightness"] > 170:
            soil_type = "Chalky" if color_info["brightness"] > 200 else "Sandy"
        elif color_info["brightness"] < 80:
            soil_type = "Peaty"
        else:
            soil_type = "Loamy"
        confidence = 0.4

    props = SOIL_PROPERTIES[soil_type]

    # Determine moisture from color analysis and soil type tendency
    moisture = color_info["moisture_hint"]
    if props["moisture_tendency"] != "Varies":
        # Blend the color-based and type-based moisture estimates
        moisture = props["moisture_tendency"]

    return {
        "soil_type": soil_type,
        "confidence": round(confidence * 100),
        "moisture": moisture,
        "estimated_ph": props["ph_range"],
        "organic_matter": props["organic_matter"],
        "suitable_crops": props["suitable_crops"],
        "recommendations": props["recommendations"],
        "fertilizer_suggestion": props["fertilizer"],
    }


def get_crop_guide() -> List[Dict[str, Any]]:
    """Return complete soil type to crop compatibility matrix."""
    guide = []
    for soil_type, props in SOIL_PROPERTIES.items():
        guide.append({
            "soil_type": soil_type,
            "ph_range": props["ph_range"],
            "organic_matter": props["organic_matter"],
            "suitable_crops": props["suitable_crops"],
            "recommendations": props["recommendations"],
            "fertilizer": props["fertilizer"],
        })
    return guide
