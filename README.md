# SoilSense - Soil Quality Analyzer

AI-powered soil quality analysis application that classifies soil types from photos and provides crop recommendations, pH estimates, moisture levels, and fertilizer suggestions.

## Features

- **Soil Classification**: 7 soil types (Clay, Sandy, Loamy, Silt, Peaty, Chalky, Saline)
- **Moisture Detection**: 6 moisture levels from Very Dry to Waterlogged
- **pH Estimation**: Visual pH scale with estimated range
- **Crop Recommendations**: Best crops for detected soil type
- **Fertilizer Suggestions**: Targeted fertilizer recommendations
- **Crop Guide**: Complete soil-to-crop compatibility matrix
- **History**: Track analyses over time

## Tech Stack

- **Backend**: Python FastAPI + PyTorch
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: MongoDB
- **ML Model**: Modified ResNet-50 for soil classification + color analysis heuristics

## GPU Requirements

- **ResNet-50 Backbone**: ~100MB download, requires ~2GB VRAM
- **Recommended**: NVIDIA GPU with 2GB+ VRAM
- **CPU Mode**: Set `USE_GPU=false` - works with ~3-5 second inference time

## Quick Start

### Docker (Recommended)

```bash
docker-compose up --build
```

Frontend: http://localhost:3001
Backend API: http://localhost:8001

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/analyze/soil | Upload soil photo for analysis |
| GET | /api/analyze/history | Analysis history |
| GET | /api/analyze/crop-guide | Full crop compatibility guide |

## License

MIT - Humanoid Maker (www.humanoidmaker.com)
