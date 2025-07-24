import { useState, useEffect } from 'react';

interface DriveFilePickerProps {
  onFileSelected: (fileId: string, fileName: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export default function DriveFilePicker({ onFileSelected, onCancel, isVisible }: DriveFilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && !gapiLoaded) {
      loadGoogleAPI();
    }
  }, [isVisible, gapiLoaded]);

  const loadGoogleAPI = async () => {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Load Google Picker API if not already loaded
      if (!window.google?.picker) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js?onload=onApiLoad';
          script.onload = () => {
            window.gapi.load('picker', resolve);
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      setGapiLoaded(true);
    } catch (error) {
      console.error('Failed to load Google API:', error);
    }
  };

  const openPicker = async () => {
    if (!gapiLoaded || !window.google?.picker) {
      console.error('Google Picker API not loaded');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get access token from your backend
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const userData = await response.json();
      const accessToken = userData.accessToken;

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(import.meta.env.VITE_GOOGLE_CLIENT_ID.split('.')[0])
        .setOAuthToken(accessToken)
        .addView(new window.google.picker.DocsView()
          .setIncludeFolders(true)
          .setMimeTypes('application/vnd.google-apps.document')
          .setSelectFolderEnabled(false))
        .setCallback(pickerCallback)
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .setTitle('Select Google Docs Essays')
        .build();
      
      picker.setVisible(true);
    } catch (error) {
      console.error('Error opening picker:', error);
      onCancel();
    }
    
    setIsLoading(false);
  };

  const pickerCallback = (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files = data.docs;
      if (files && files.length > 0) {
        // For now, handle the first selected file
        const file = files[0];
        onFileSelected(file.id, file.name);
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
      onCancel();
    }
  };

  useEffect(() => {
    if (isVisible && gapiLoaded) {
      openPicker();
    }
  }, [isVisible, gapiLoaded]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Google Drive Picker...
              </h3>
              <p className="text-gray-600">
                Please wait while we load the file picker.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Google Docs
              </h3>
              <p className="text-gray-600 mb-6">
                Choose Google Docs essays to add to your collection. The picker will open in a new window.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={openPicker}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Picker
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
