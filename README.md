# Image AI Processing Application Documentation

## Overview

This Node.js application processes images using Google's Gemini AI to extract and categorize text content such as movie titles, TV series, anime, manga, songs, books, and jokes. The application scans directories for images, converts them to base64 data URIs, and uses the Gemini API to analyze and extract meaningful text content.

## Project Structure

```
image_ai/
├── app.js                      # Main Express server
├── package.json                # Dependencies and project metadata
├── bot/
│   └── image_processor.js      # Core image processing logic
├── services/
│   └── gemini_hit.js          # Gemini API service
├── shared/
│   ├── imgTouri.js            # Image to URI conversion utility
│   └── logger.js              # Winston logging configuration
└── images/                     # Directory for input images (created by user)
```

## Features

- **Recursive Image Scanning**: Automatically finds images in directories and subdirectories
- **Multi-format Support**: Supports PNG, JPG, JPEG, WEBP, HEIC, HEIF formats
- **AI-Powered Text Extraction**: Uses Google Gemini 2.0 Flash to extract and categorize text
- **Comprehensive Logging**: Detailed logging with stack trace information
- **Rate Limiting**: Built-in delays between API calls to respect rate limits
- **Error Handling**: Robust error handling with detailed error reporting
- **JSON Output**: Structured output in multiple formats for easy consumption

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Google AI Studio API key

### Setup Steps

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Create a `.env` file in the root directory:
   ```env
   gemini_api_key=your_google_ai_api_key_here
   PORT=9000
   LOG_LEVEL=info
   ```

4. **Create images directory**:
   ```bash
   mkdir images
   ```

5. **Add your images**:
   Place your images in the `images/` directory (supports subdirectories)

## Dependencies

### Core Dependencies
- **express**: Web framework for the API server
- **@google/generative-ai**: Google Gemini AI client
- **dotenv**: Environment variable management
- **winston**: Advanced logging framework
- **axios**: HTTP client (for potential future API calls)
- **stack-trace**: Call stack information for logging

### Development Setup
- **type**: "module" - Uses ES6 modules
- **Node.js version**: Compatible with modern Node.js versions

## Configuration

### Environment Variables
- `gemini_api_key`: Your Google AI Studio API key (required)
- `PORT`: Server port (default: 9000)
- `LOG_LEVEL`: Logging level (default: info)

### Supported Image Formats
- PNG (.png)
- JPEG (.jpg, .jpeg)
- WebP (.webp)
- HEIC (.heic)
- HEIF (.heif)

## Usage

### Running the Application

1. **Start the server**:
   ```bash
   node app.js
   ```

2. **Verify server is running**:
   Visit `http://localhost:9000/check` or the configured port

3. **Process images**:
   The image processing runs automatically when you execute:
   ```bash
   node bot/image_processor.js
   ```

### API Endpoints

- `GET /check`: Health check endpoint that returns "This is working fine"

## Core Components

### 1. Image Processor (`bot/image_processor.js`)

**Key Functions:**
- `getAllImages(dirPath)`: Recursively scans directories for supported image files
- `llmObj(FILE_URI, datatype)`: Constructs the Gemini API request payload
- `main()`: Orchestrates the entire processing workflow
- `specifcFormat(data)`: Formats results into a flattened structure

**Processing Flow:**
1. Scan `./images` directory for image files
2. Convert each image to base64 data URI
3. Send to Gemini API for text extraction and categorization
4. Process responses and save results
5. Format data for final output

### 2. Gemini Service (`services/gemini_hit.js`)

Handles communication with Google's Gemini API:
- Configures the generative model
- Sends image data and prompts
- Parses JSON responses
- Includes error handling for API calls

### 3. Image Utilities (`shared/imgTouri.js`)

Converts image files to base64 data URIs:
- Validates file existence and format
- Reads binary image data
- Converts to base64 encoding
- Maps file extensions to MIME types
- Returns structured URI objects

### 4. Logging System (`shared/logger.js`)

Advanced logging with Winston:
- Color-coded log levels
- Stack trace integration
- Function name and line number tracking
- Timestamp formatting
- Metadata support

## AI Processing Details

### Text Categories
The AI extracts and categorizes text into:
- **Movie**: Movie titles
- **Series**: TV series names
- **Anime**: Anime titles
- **Manga**: Manga titles
- **Manhwa**: Manhwa titles
- **Song**: Song titles
- **Book**: Book titles
- **Joke**: Text-based jokes and meme captions

### Response Format
Each extracted item includes:
- `text`: Exact extracted text with original formatting
- `type`: Category classification
- `confidence`: AI confidence score (0-1)

### AI Prompt Strategy
The system uses a detailed prompt that:
- Instructs careful examination of the entire image
- Emphasizes exact text preservation
- Requires confidence scoring
- Prioritizes accuracy over speed

## Output Files

The application generates several output files:

1. **`extracted_uri.json`**: Contains base64 URIs of all processed images
2. **`ai_results.json`**: Raw API responses with processing status
3. **Console output**: Formatted final results in JSON format

### Sample Output Structure
```json
[
  {
    "Filename": "./images/example.jpg",
    "Status": "success",
    "Txt": "The Matrix",
    "Type": "Movie",
    "Confidence": 0.95
  }
]
```

## Error Handling

The application includes comprehensive error handling:
- File validation before processing
- API rate limiting with delays
- Individual image failure isolation
- Detailed error logging
- Graceful degradation for failed images

## Performance Considerations

- **Rate Limiting**: 1-second delay between API calls
- **Memory Management**: Processes images sequentially
- **Error Isolation**: Failed images don't stop the entire process
- **Logging**: Configurable log levels to reduce output

## Troubleshooting

### Common Issues

1. **"File does not exist" errors**:
   - Ensure images are in the `./images` directory
   - Check file permissions

2. **API key errors**:
   - Verify `gemini_api_key` in `.env` file
   - Ensure API key has proper permissions

3. **Unsupported format errors**:
   - Check that images are in supported formats
   - Verify file extensions are lowercase

4. **Empty results**:
   - Check image quality and text visibility
   - Review AI confidence scores

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

## Future Enhancements

Potential improvements could include:
- RESTful API endpoints for image upload
- Batch processing optimization
- Database integration for result storage
- Web interface for image upload and results viewing
- Additional AI model support
- Image preprocessing capabilities
