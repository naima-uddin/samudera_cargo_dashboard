// services/siteSettings.js
import axiosInstance from '@/lib/axiosInstance';

// GET current site settings (public endpoint, but reused in dashboard)
export const getSiteSettings = async () => {
  try {
    const response = await axiosInstance.get('/site-settings');
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    throw new Error(response.data.message || 'Failed to fetch site settings');
  } catch (error) {
    console.error('Get site settings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch site settings',
    };
  }
};

// UPDATE site settings (admin only)
export const updateSiteSettings = async (payload) => {
  try {
    const response = await axiosInstance.put('/site-settings', payload);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Site settings updated successfully',
      };
    }
    throw new Error(response.data.message || 'Failed to update site settings');
  } catch (error) {
    console.error('Update site settings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update site settings',
    };
  }
};
