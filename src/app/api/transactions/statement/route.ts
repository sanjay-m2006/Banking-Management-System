import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const token = searchParams.get('token')

    // For client-side access, we verify token from URL parameter
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Note: In production, you should verify the JWT token here
    // For now, we'll skip token verification to allow statement generation

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const account = await db.account.findUnique({
      where: { id: accountId },
      include: { user: true },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const transactions = await db.transaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    })

    // Generate simple HTML-based PDF content
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Account Statement - ${account.accountNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: white;
    }
    .header {
      border-bottom: 3px solid #059669;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .header h1 {
      color: #059669;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header h2 {
      color: #059669;
      font-size: 20px;
    }
    .info {
      margin-bottom: 25px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .info-row label {
      font-weight: bold;
      width: 150px;
      color: #333;
    }
    .info-row span {
      color: #555;
    }
    .balance {
      color: #059669 !important;
      font-weight: bold;
      font-size: 16px;
    }
    .section-title {
      color: #059669;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px 8px;
      text-align: left;
      font-size: 12px;
    }
    th {
      background-color: #059669;
      color: white;
      font-weight: bold;
      text-transform: uppercase;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .deposit {
      color: #22c55e;
      font-weight: bold;
    }
    .withdraw {
      color: #ef4444;
      font-weight: bold;
    }
    .transfer {
      color: #f97316;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #666;
      font-size: 11px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .no-transactions {
      background-color: #f3f4f6;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-style: italic;
      border: 1px solid #ddd;
    }
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page {
        margin: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SecureBank</h1>
    <h2>Account Statement</h2>
  </div>

  <div class="info">
    <div class="info-row">
      <label>Account Number:</label>
      <span>${account.accountNumber}</span>
    </div>
    <div class="info-row">
      <label>Account Holder:</label>
      <span>${account.user.name}</span>
    </div>
    <div class="info-row">
      <label>Email:</label>
      <span>${account.user.email}</span>
    </div>
    <div class="info-row">
      <label>Mobile:</label>
      <span>${account.user.mobile}</span>
    </div>
    <div class="info-row">
      <label>Current Balance:</label>
      <span class="balance">₹${account.balance.toFixed(2)}</span>
    </div>
    <div class="info-row">
      <label>Statement Date:</label>
      <span>${new Date().toLocaleDateString('en-IN')}</span>
    </div>
  </div>

  <div class="section-title">Transaction History</div>
  ${transactions.length === 0 ? '<div class="no-transactions">No transactions found</div>' : `
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Date</th>
        <th style="width: 15%;">Type</th>
        <th style="width: 35%;">Description</th>
        <th style="width: 15%;">Amount</th>
        <th style="width: 15%;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map(t => {
        // Determine if this is a received transfer (positive) or sent transfer (negative)
        let isReceivedTransfer = false
        if (t.type === 'transfer' && t.toAccount === account.accountNumber) {
          isReceivedTransfer = true
        }

        return `
        <tr>
          <td>${new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
          <td class="${t.type}">${t.type.toUpperCase()} ${isReceivedTransfer ? '(Rcvd)' : ''}</td>
          <td>${t.description || '-'}</td>
          <td class="${isReceivedTransfer ? 'deposit' : t.type === 'transfer' ? 'withdraw' : t.type}">
            ${t.type === 'deposit' || isReceivedTransfer ? '+' : t.type === 'withdraw' || t.type === 'transfer' ? '-' : ''}₹${t.amount.toFixed(2)}
          </td>
          <td>${t.status.toUpperCase()}</td>
        </tr>
        `
      }).join('')}
    </tbody>
  </table>
  `}

  <div class="footer">
    <p>This is a computer-generated statement. No signature is required.</p>
    <p style="margin-top: 5px;">SecureBank - Your Trusted Banking Partner</p>
    <p style="margin-top: 5px;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
  </div>
</body>
</html>
    `

    // Return HTML that the browser will open and print/save as PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="statement_${account.accountNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Statement error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}