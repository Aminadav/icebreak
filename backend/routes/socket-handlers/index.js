// Socket event handlers
const handleRegisterDevice = require('./registerDevice');
const handleSetGameName = require('./setGameName');
const handleStartGameCreation = require('./startGameCreation');
const handleCreateGameNow = require('./createGameNow');
const handleSubmitPhoneNumber = require('./submitPhoneNumber');
const handleVerify2FACode = require('./verify2FACode');
const handlePing = require('./ping');
const handleTrackEvent = require('./trackEvent');
const handleSaveEmail = require('./saveEmail');
const handleResetJourneyState = require('./resetJourneyState');
const handleUpdateJourneyState = require('./updateJourneyState');
const handleSaveUserName = require('./saveUserName');
const handleSaveUserGender = require('./saveUserGender');
const handleUploadPendingImage = require('./uploadPendingImage');
const handleDownloadWhatsappImage = require('./downloadWhatsappImage');
const handleBackgroundWhatsappDownload = require('./backgroundWhatsappDownload');
const handleUseWhatsappImage = require('./useWhatsappImage');
const handleLoadExistingGalleryImages = require('./loadExistingGalleryImages');
const handleGenerateImageGallery = require('./generateImageGallery');
const handleConfirmImageSelection = require('./confirmImageSelection');

module.exports = {
  handleRegisterDevice,
  handleSetGameName,
  handleStartGameCreation,
  handleCreateGameNow,
  handleSubmitPhoneNumber,
  handleVerify2FACode,
  handlePing,
  handleTrackEvent,
  handleSaveEmail,
  handleResetJourneyState,
  handleUpdateJourneyState,
  handleSaveUserName,
  handleSaveUserGender,
  handleUploadPendingImage,
  handleDownloadWhatsappImage,
  handleBackgroundWhatsappDownload,
  handleUseWhatsappImage,
  handleLoadExistingGalleryImages,
  handleGenerateImageGallery,
  handleConfirmImageSelection
};
