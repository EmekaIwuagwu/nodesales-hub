using Microsoft.Data.Sqlite;
using KortanaWallet.Models;
using KortanaWallet.Core.Constants;
using System.Text.Json;

namespace KortanaWallet.Services
{
    public class TransactionService : ITransactionService
    {
        private string _dbPath;

        public TransactionService()
        {
            _dbPath = Path.Combine(FileSystem.AppDataDirectory, "kortana_cache.db");
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection($"Data Source={_dbPath}");
            connection.Open();
            
            var command = connection.CreateCommand();
            command.CommandText = 
            @"
                CREATE TABLE IF NOT EXISTS Transactions (
                    Hash TEXT PRIMARY KEY,
                    FromAddress TEXT,
                    ToAddress TEXT,
                    Amount REAL,
                    TokenSymbol TEXT,
                    Status TEXT,
                    Timestamp DATETIME,
                    Direction INTEGER
                )
            ";
            command.ExecuteNonQuery();
        }

        public async Task<List<Transaction>> GetTransactionHistoryAsync(string address, int offset = 0, int limit = 20)
        {
            var transactions = new List<Transaction>();

            using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = 
                "SELECT Hash, FromAddress, ToAddress, Amount, TokenSymbol, Status, Timestamp, Direction " +
                "FROM Transactions ORDER BY Timestamp DESC LIMIT $limit OFFSET $offset";
            
            command.Parameters.AddWithValue("$limit", limit);
            command.Parameters.AddWithValue("$offset", offset);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                transactions.Add(new Transaction
                {
                    Hash = reader.GetString(0),
                    FromAddress = reader.GetString(1),
                    ToAddress = reader.GetString(2),
                    Amount = reader.GetDouble(3),
                    TokenSymbol = reader.GetString(4),
                    Status = (TransactionStatus)reader.GetInt32(5),
                    Timestamp = reader.GetDateTime(6),
                    Direction = (TransactionDirection)reader.GetInt32(7)
                });
            }

            return transactions;
        }

        public async Task SaveTransactionAsync(Transaction tx)
        {
            using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = 
            @"
                INSERT OR REPLACE INTO Transactions (Hash, FromAddress, ToAddress, Amount, TokenSymbol, Status, Timestamp, Direction)
                VALUES ($hash, $from, $to, $amount, $symbol, $status, $time, $direction)
            ";
            
            command.Parameters.AddWithValue("$hash", tx.Hash ?? Guid.NewGuid().ToString());
            command.Parameters.AddWithValue("$from", tx.FromAddress);
            command.Parameters.AddWithValue("$to", tx.ToAddress);
            command.Parameters.AddWithValue("$amount", tx.Amount);
            command.Parameters.AddWithValue("$symbol", tx.TokenSymbol);
            command.Parameters.AddWithValue("$status", (int)tx.Status);
            command.Parameters.AddWithValue("$time", tx.Timestamp);
            command.Parameters.AddWithValue("$direction", (int)tx.Direction);

            await command.ExecuteNonQueryAsync();
        }

        public async Task ClearHistoryAsync()
        {
            using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM Transactions";
            await command.ExecuteNonQueryAsync();
        }
    }
}
