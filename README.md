# Bihar Health Connect

An application to find and book appointments with doctors in Bihar, featuring AI-powered doctor recommendations based on symptoms.

## ✨ Features

- **Doctor Search**: Filter doctors by location and specialty.
- **AI Recommendation**: Describe your symptoms to get an AI-powered recommendation for a doctor's specialty.
- **Appointment Booking**: Book appointments with available doctors.
- **Admin Panel**: A separate view for clinic administrators to add new doctor profiles.
- **Mock Authentication**: Simple login system to simulate patient and admin roles.
- **Responsive Design**: Works on both desktop and mobile devices.

---

## 🚀 Getting Started & Deployment

This is a static web application built with React and Tailwind CSS. It does not require a complex build step. You can deploy it to any modern static hosting service.

### IMPORTANT: Configuring the API Key

The AI-powered recommendation feature uses the Google Gemini API. To make this work on your live website, you **must** provide an API key.

1.  **Get a Key**: Obtain your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Set Environment Variable**: The code reads the key from `process.env.API_KEY`. You need to set this `API_KEY` as an **environment variable** in your hosting provider's settings.

### Deploying to Netlify (Recommended)

Netlify is a great platform for hosting static sites. The process is very straightforward.

1.  **Push to GitHub**:
    - Create a new repository on [GitHub](https://github.com/new).
    - Upload all the project files (`index.html`, `App.tsx`, etc., including the new `README.md` and `package.json`) to this repository.

2.  **Sign up & Connect to Netlify**:
    - Create a free account on [Netlify](https://www.netlify.com).
    - Click "Add new site" -> "Import an existing project".
    - Connect to your GitHub account and select the repository you just created.

3.  **Configure Deployment Settings**:
    - Netlify will automatically detect the settings from the `netlify.toml` file included in this project. You should not need to change anything. The site will be published from the root directory.

4.  **Add Your Environment Variable**:
    - In your new site's dashboard on Netlify, go to "Site configuration" -> "Environment variables".
    - Click "Add a variable".
    - For the **Key**, enter `API_KEY`.
    - For the **Value**, paste your Google Gemini API key.
    - Click "Create variable".

5.  **Deploy**:
    - Go back to the "Deploys" tab and trigger a new deploy by clicking "Deploy site".
    - Once the deploy is finished, your site will be live on a public URL!

---

This project is ready for deployment. Follow the steps above to make it accessible to everyone.