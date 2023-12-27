const { Sequelize } = require('sequelize');

const dbsequelizeTallahassee = {
  database: 'Tallahassee',
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'mysql',
};

const sequelizeTallahassee = new Sequelize(dbsequelizeTallahassee);

const getStatusCounts = async (req, res) => {
  try {
    const statusCounts = await sequelizeTallahassee.query(`
      SELECT
        t.emp_id,
        'TallahasseeInventories' AS table_name,
        COUNT(DISTINCT t.claim_id) AS total_claims,
        SUM(DISTINCT CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(DISTINCT CASE WHEN t.status = 'inprogress' THEN 1 ELSE 0 END) AS inprogress,
        SUM(DISTINCT CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM
        tallahassee.TallahasseeInventories t
      GROUP BY
        t.emp_id

      UNION ALL

      SELECT
        a.emp_id,
        'AsheInventories' AS table_name,
        COUNT(DISTINCT a.claim_id) AS total_claims,
        SUM(DISTINCT CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(DISTINCT CASE WHEN a.status = 'inprogress' THEN 1 ELSE 0 END) AS inprogress,
        SUM(DISTINCT CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM
        ashe.AsheInventories a
      GROUP BY
        a.emp_id
    `, { type: Sequelize.QueryTypes.SELECT });

    const formattedResults = statusCounts.map(result => {
      const tableName = result.table_name.replace(/Inventories$/, ''); 
      return {
        client_name: tableName,
        emp_id: result.emp_id,
        completed: result.completed,
        inprogress: result.inprogress,
        pending: result.pending
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error('Error retrieving status counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getStatusCounts };
