# Poem App Marketing Website

This project is a marketing website for the Poem App, designed to showcase its features and attract users. Below are the details of the project structure and how to set it up.

## Project Structure

```
reddah.cn
├── index.html        # Main HTML document for the website
├── css
│   └── style.css     # Styles for the website
├── js
│   └── main.js       # JavaScript code for interactivity
├── images            # Folder for image assets
└── README.md         # Documentation for the project
```

## Setup Instructions

1. **Clone the Repository**: 
   Clone this repository to your local machine using:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**:
   ```
   cd reddah.cn
   ```

3. **Open the `index.html` File**:
   You can open the `index.html` file in your web browser to view the marketing page.

4. **Deploying to Apache**:
   To deploy this website to an Apache server, copy the contents of the `reddah.cn` folder to the Apache web directory:
   ```
   sudo cp -r reddah.cn/* /var/www/html/
   ```

5. **Access the Website**:
   After deployment, you can access the website by navigating to `http://your-server-ip/` in your web browser.

## Features

- **Responsive Design**: The website is designed to be responsive and works well on various devices.
- **Interactive Elements**: JavaScript is used to enhance user experience with interactive features.
- **Image Assets**: The images folder is ready to store promotional graphics and logos.

## Contributing

Feel free to contribute to this project by submitting issues or pull requests. Your feedback and contributions are welcome!

## License

This project is licensed under the MIT License. See the LICENSE file for more details.