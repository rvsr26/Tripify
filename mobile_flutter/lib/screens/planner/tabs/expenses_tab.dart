import 'package:flutter/material.dart';
import '../../../services/api_service.dart';
import '../../../widgets/glass_panel.dart';

class ExpensesTab extends StatefulWidget {
  final dynamic trip;
  final Function(dynamic) onUpdate;

  const ExpensesTab({super.key, required this.trip, required this.onUpdate});

  @override
  State<ExpensesTab> createState() => _ExpensesTabState();
}

class _ExpensesTabState extends State<ExpensesTab> {
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  bool _submitting = false;

  Future<void> _addExpense() async {
    if (_descController.text.isEmpty || _amountController.text.isEmpty) return;
    setState(() => _submitting = true);
    
    try {
      final res = await ApiService.post('/planner/${widget.trip['_id']}/expense', {
        'description': _descController.text,
        'amount': double.parse(_amountController.text),
      });
      
      if (res.statusCode == 200) {
        // Handle update
        _descController.clear();
        _amountController.clear();
      }
    } catch (e) {
      // Error
    }
    setState(() => _submitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final expenses = widget.trip['expenses'] as List? ?? [];
    final currency = widget.trip['currency'] ?? '\$';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Add Expense", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildAddForm(),
          const SizedBox(height: 32),
          const Text("Settlement Status", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildSettlementCard(),
          const SizedBox(height: 32),
          const Text("Recent Transactions", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ...expenses.reversed.map((e) => _buildExpenseItem(e, currency)),
        ],
      ),
    );
  }

  Widget _buildAddForm() {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          TextField(
            controller: _descController,
            decoration: const InputDecoration(hintText: "Description (e.g. Dinner)"),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: "Amount"),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _submitting ? null : _addExpense,
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 45)),
            child: Text(_submitting ? "SUBMITTING..." : "ADD EXPENSE"),
          ),
        ],
      ),
    );
  }

  Widget _buildSettlementCard() {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: Column(
          children: [
            const Text("⚖️", style: TextStyle(fontSize: 32)),
            const SizedBox(height: 12),
            const Text(
              "Everybody is settled up!",
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExpenseItem(dynamic e, String currency) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassPanel(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(e['description'] ?? "Expense", style: const TextStyle(fontWeight: FontWeight.bold)),
            Text("$currency${e['amount']}", style: const TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }
}
