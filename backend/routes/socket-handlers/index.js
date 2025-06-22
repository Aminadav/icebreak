// Socket event handlers
const handleRegisterDevice = require('./registerDevice');
const handleSetGameName = require('./setGameName');
const handleStartGameCreation = require('./startGameCreation');
const handleCreateGameNow = require('./createGameNow');
const handleCreateGameImmediately = require('./createGameImmediately');
const handleGetGameData = require('./getGameData');
const handleUpdateGameName = require('./updateGameName');
const handleSubmitPhoneNumber = require('./submitPhoneNumber');
const handleVerify2FACode = require('./verify2FACode');
const handlePing = require('./ping');
const handleTrackEvent = require('./trackEvent');
const handleSaveEmail = require('./saveEmail');
const handleSaveUserName = require('./saveUserName');
const handleSaveUserGender = require('./saveUserGender');
const handleUploadPendingImage = require('./uploadPendingImage');
const handleDownloadWhatsappImage = require('./downloadWhatsappImage');
const handleBackgroundWhatsappDownload = require('./backgroundWhatsappDownload');
const handleUseWhatsappImage = require('./useWhatsappImage');
const handleLoadExistingGalleryImages = require('./loadExistingGalleryImages');
const handleGenerateImageGallery = require('./generateImageGallery');
const handleConfirmImageSelection = require('./confirmImageSelection');
const handleGetMyPoints = require('./getMyPoints');

module.exports = {
  handleRegisterDevice,
  handleSetGameName,
  handleStartGameCreation,
  handleCreateGameNow,
  handleCreateGameImmediately,
  handleGetGameData,
  handleUpdateGameName,
  handleSubmitPhoneNumber,
  handleVerify2FACode,
  handlePing,
  handleTrackEvent,
  handleSaveEmail,
  handleSaveUserName,
  handleSaveUserGender,
  handleUploadPendingImage,
  handleDownloadWhatsappImage,
  handleBackgroundWhatsappDownload,
  handleUseWhatsappImage,
  handleLoadExistingGalleryImages,
  handleGenerateImageGallery,
  handleConfirmImageSelection,
  handleGetMyPoints
};
