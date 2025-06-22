const db = require('../config/database');

/**
 * Updates a user_id across all tables in the database
 * This function automatically finds all tables with user_id columns and updates them
 * @param {string} tempUserId - The temporary user ID to replace
 * @param {string} realUserId - The real user ID to replace with
 * @returns {Promise<Object>} - Result object with updated tables and counts
 */
async function updateUserIdAcrossAllTables(tempUserId, realUserId) {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`🔄 Starting user_id update from ${tempUserId} to ${realUserId}`);
    
    // Find all tables with columns containing 'user_id' (including creator_user_id, owner_user_id, etc.), excluding users table for special handling
    const tablesQuery = `
      SELECT DISTINCT
        t.table_name,
        c.column_name
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND c.column_name LIKE '%user_id%'
        AND t.table_name != 'users'
      ORDER BY t.table_name, c.column_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows;
    
    console.log(`📋 Found ${tables.length} tables with *user_id* columns:`, 
      tables.map(t => `${t.table_name}.${t.column_name}`));
    
    const updateResults = [];
    
    // Update each table
    for (const table of tables) {
      const tableName = table.table_name;
      const columnName = table.column_name;
      
      try {
        // First check if there are any records with the temp user_id
        const checkQuery = `SELECT COUNT(*) as count FROM "${tableName}" WHERE "${columnName}" = $1`;
        const checkResult = await client.query(checkQuery, [tempUserId]);
        const recordCount = parseInt(checkResult.rows[0].count);
        
        if (recordCount > 0) {
          // Update the records
          const updateQuery = `UPDATE "${tableName}" SET "${columnName}" = $1 WHERE "${columnName}" = $2`;
          const updateResult = await client.query(updateQuery, [realUserId, tempUserId]);
          
          updateResults.push({
            table: tableName,
            column: columnName,
            recordsUpdated: updateResult.rowCount,
            success: true
          });
          
          console.log(`✅ Updated ${updateResult.rowCount} records in ${tableName}.${columnName}`);
        } else {
          updateResults.push({
            table: tableName,
            column: columnName,
            recordsUpdated: 0,
            success: true,
            note: 'No records found with temp user_id'
          });
          
          console.log(`ℹ️  No records to update in ${tableName}.${columnName}`);
        }
      } catch (error) {
        updateResults.push({
          table: tableName,
          column: columnName,
          recordsUpdated: 0,
          success: false,
          error: error.message
        });
        
        console.error(`❌ Failed to update ${tableName}.${columnName}:`, error.message);
        throw error; // Re-throw to rollback transaction
      }
    }
    
    // Handle users table separately (special case for merging data)
    try {
      // Check if the target user already exists
      const targetUserQuery = 'SELECT * FROM users WHERE user_id = $1';
      const targetUserResult = await client.query(targetUserQuery, [realUserId]);
      
      // Get the temp user data
      const tempUserQuery = 'SELECT * FROM users WHERE user_id = $1';
      const tempUserResult = await client.query(tempUserQuery, [tempUserId]);
      
      if (targetUserResult.rows.length > 0 && tempUserResult.rows.length > 0) {
        // Target user exists - merge data and delete temp user
        const targetUser = targetUserResult.rows[0];
        const tempUser = tempUserResult.rows[0];
        
        // Update target user with any missing data from temp user
        const updateTargetQuery = `
          UPDATE users 
          SET 
            email = COALESCE($1, email),
            name = COALESCE($2, name),
            gender = COALESCE($3, gender),
            pending_image = COALESCE($4, pending_image),
            has_image = COALESCE($5, has_image),
            image = COALESCE($6, image),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $7
        `;
        
        await client.query(updateTargetQuery, [
          tempUser.email,
          tempUser.name,
          tempUser.gender,
          tempUser.pending_image,
          tempUser.has_image,
          tempUser.image,
          realUserId
        ]);
        
        // Delete the temp user
        await client.query('DELETE FROM users WHERE user_id = $1', [tempUserId]);
        
        updateResults.push({
          table: 'users',
          action: 'merged_and_deleted_temp',
          success: true
        });
        
        console.log(`✅ Merged temp user data into existing user and deleted temp user`);
      } else if (tempUserResult.rows.length > 0) {
        // Target user doesn't exist - just update the user_id
        const updateUserIdQuery = 'UPDATE users SET user_id = $1 WHERE user_id = $2';
        const updateResult = await client.query(updateUserIdQuery, [realUserId, tempUserId]);
        
        updateResults.push({
          table: 'users',
          recordsUpdated: updateResult.rowCount,
          action: 'updated_user_id',
          success: true
        });
        
        console.log(`✅ Updated user_id in users table: ${updateResult.rowCount} record(s)`);
      } else {
        updateResults.push({
          table: 'users',
          action: 'no_temp_user_found',
          success: true
        });
        
        console.log(`ℹ️  No temp user found to process`);
      }
    } catch (error) {
      updateResults.push({
        table: 'users',
        success: false,
        error: error.message
      });
      
      console.error(`❌ Failed to process users table:`, error.message);
      throw error;
    }
    
    await client.query('COMMIT');
    
    const totalUpdated = updateResults.reduce((sum, result) => sum + result.recordsUpdated, 0);
    console.log(`🎉 Successfully updated ${totalUpdated} records across ${tables.length} tables`);
    
    return {
      success: true,
      tablesProcessed: tables.length,
      totalRecordsUpdated: totalUpdated,
      updateResults
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction rolled back due to error:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  updateUserIdAcrossAllTables
};
