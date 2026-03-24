import mongoose from 'mongoose';

/**
 * Utility to run operations within a transaction if supported by the MongoDB deployment.
 * Falls back to a non-transactional execution if transactions are not supported (e.g., standalone instance).
 * 
 * @param {Function} callback - The function containing operations to be executed.
 * @returns {Promise<any>} - The result of the callback.
 */
export const runInTransaction = async (callback) => {
    const session = await mongoose.startSession();

    // Check if the MongoDB deployment is a replica set or sharded cluster
    const topologyType = mongoose.connection?.getClient()?.topology?.description?.type;
    const isReplicaSet = !!mongoose.connection?.replicaSet || (topologyType !== 'Standalone' && !!topologyType);

    if (!isReplicaSet) {
        // Fallback for standalone (Development/Local)
        try {
            const result = await callback(null); // Pass null as session
            return result;
        } finally {
            session.endSession();
        }
    }

    // Standard Transaction workflow for Replica Sets
    session.startTransaction();
    try {
        const result = await callback(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        session.endSession();
    }
};
