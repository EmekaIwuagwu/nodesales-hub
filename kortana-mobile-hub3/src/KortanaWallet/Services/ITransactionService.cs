using KortanaWallet.Models;

namespace KortanaWallet.Services
{
    public interface ITransactionService
    {
        Task<List<Transaction>> GetTransactionHistoryAsync(string address, int offset = 0, int limit = 20);
        Task SaveTransactionAsync(Transaction transaction);
        Task ClearHistoryAsync();
    }
}
