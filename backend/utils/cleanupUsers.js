const User = require('../models/user');

/**
 * Removes users who haven't logged in for more than 60 days
 */
async function cleanupInactiveUsers() {
    try {
        // Calculate date 60 days ago
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Find and delete inactive users
        const result = await User.deleteMany({
            lastLoggedIn: { $lt: sixtyDaysAgo }
        });

        console.log(`Cleanup completed: ${result.deletedCount} inactive users removed`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up inactive users:', error);
        throw error;
    }
}

module.exports = { cleanupInactiveUsers };