import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FinancialBreakdownItem } from '../transactions/types/financial-breakdown.type';
import { TransactionHistoryEntry } from '../transactions/types/transaction-history.type';

@Injectable()
export class PdfService {
  private readonly templatePath: string;

  constructor() {
    // Use process.cwd() to get project root, works in both dev and production
    this.templatePath = join(
      process.cwd(),
      'src',
      'transactions',
      'templates',
      'financial-breakdown.template.html',
    );
  }

  async generateFinancialBreakdownPdf(
    data: FinancialBreakdownItem[],
  ): Promise<Buffer> {
    const html = this.generateHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = (await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      })) as Buffer;

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  private generateHtml(data: FinancialBreakdownItem[]): string {
    // Read template file
    let template = readFileSync(this.templatePath, 'utf-8');

    // Generate transactions HTML
    const transactionsHtml = data
      .map((transaction, index) => {
        const commissionHtml = transaction.commission
          ? this.generateCommissionHtml(transaction.commission)
          : '<div class="commission-section"><p><em>No commission data available</em></p></div>';

        return `
          <div class="transaction-block">
            <div class="transaction-header">
              <h2>Transaction #${index + 1}</h2>
            </div>
            <div class="transaction-info">
              <div class="info-row">
                <span class="label">Transaction ID:</span>
                <span class="value">${String(transaction._id)}</span>
              </div>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${transaction.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Description:</span>
                <span class="value">${transaction.description}</span>
              </div>
            </div>
            ${commissionHtml}
          </div>
        `;
      })
      .join('');

    // Replace template placeholders
    template = template.replace(
      '{{generatedDate}}',
      new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
    );
    template = template.replace('{{transactionsHtml}}', transactionsHtml);

    return template;
  }

  private generateCommissionHtml(commission: {
    _id: any;
    agencyAmount: number | null;
    agents: Array<{
      agentId: any;
      role: 'listing' | 'selling';
      amount: number;
      name?: string;
      surname?: string;
      email?: string;
    }> | null;
  }): string {
    const agentsHtml = this.generateAgentsHtml(commission.agents);

    return `
      <div class="commission-section">
        <h3>Commission Details</h3>
        <div class="commission-info">
          <p><strong>Commission ID:</strong> ${String(commission._id || 'N/A')}</p>
          <p><strong>Agency Amount:</strong> $${commission.agencyAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
        </div>
        ${agentsHtml}
      </div>
    `;
  }

  private generateAgentsHtml(
    agents: Array<{
      agentId: any;
      role: 'listing' | 'selling';
      amount: number;
      name?: string;
      surname?: string;
      email?: string;
    }> | null,
  ): string {
    if (!agents || agents.length === 0) {
      return '<p><em>No agents assigned</em></p>';
    }

    const rowsHtml = agents
      .map(
        (agent) => `
      <tr>
        <td>${agent.name || 'N/A'} ${agent.surname || ''}</td>
        <td>${agent.email || 'N/A'}</td>
        <td><span class="role-badge role-${agent.role}">${agent.role}</span></td>
        <td class="amount">$${agent.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <table class="agents-table">
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  async generateTransactionHistoryPdf(
    transactionId: string,
    transactionName: string,
    history: TransactionHistoryEntry[],
  ): Promise<Buffer> {
    const html = this.generateTransactionHistoryHtml(
      transactionId,
      transactionName,
      history,
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = (await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      })) as Buffer;

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  private generateTransactionHistoryHtml(
    transactionId: string,
    transactionName: string,
    history: TransactionHistoryEntry[],
  ): string {
    const historyTemplatePath = join(
      process.cwd(),
      'src',
      'transactions',
      'templates',
      'transaction-history.template.html',
    );
    let template = readFileSync(historyTemplatePath, 'utf-8');

    // Generate transaction info HTML
    const transactionInfoHtml = `
      <div class="transaction-info">
        <h2>Transaction Information</h2>
        <div class="info-row">
          <span class="label">Transaction ID:</span>
          <span class="value">${transactionId}</span>
        </div>
        <div class="info-row">
          <span class="label">Transaction Name:</span>
          <span class="value">${transactionName || 'N/A'}</span>
        </div>
      </div>
    `;

    // Generate history HTML
    const historyHtml =
      history.length === 0
        ? '<p style="text-align: center; color: #666; padding: 40px;"><em>No history entries found</em></p>'
        : history
            .map((entry, index) => {
              const typeClass = `type-${entry.type}`;
              const date = entry.createdAt
                ? new Date(entry.createdAt).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })
                : 'N/A';

              let contentHtml = '';

              if (entry.payload) {
                // Handle ChangeStage
                if (entry.type === 'ChangeStage' && entry.payload.details) {
                  contentHtml = `
                    <div class="history-details">
                      <p><strong>Details:</strong> ${String(entry.payload.details)}</p>
                    </div>
                  `;
                }
                // Handle CommissionCalculation
                else if (
                  entry.type === 'CommissionCalculation' &&
                  entry.payload
                ) {
                  const payload = entry.payload as {
                    details?: string;
                    agencyAmount?: number;
                    agents?: Array<{
                      id?: string;
                      name?: string;
                      surname?: string;
                      email?: string;
                      phone?: string;
                      amount?: number;
                      role?: 'listing' | 'selling';
                    }>;
                  };

                  let agentsHtml = '';
                  if (payload.agents && payload.agents.length > 0) {
                    agentsHtml = `
                      <div class="agents-list">
                        <h4>Agents Commission</h4>
                        ${payload.agents
                          .map(
                            (agent) => `
                          <div class="agent-item">
                            <div class="agent-row">
                              <span class="agent-label">Name:</span>
                              <span class="agent-value">${agent.name || 'N/A'} ${agent.surname || ''}</span>
                            </div>
                            <div class="agent-row">
                              <span class="agent-label">Email:</span>
                              <span class="agent-value">${agent.email || 'N/A'}</span>
                            </div>
                            <div class="agent-row">
                              <span class="agent-label">Phone:</span>
                              <span class="agent-value">${agent.phone || 'N/A'}</span>
                            </div>
                            <div class="agent-row">
                              <span class="agent-label">Role:</span>
                              <span class="agent-value">
                                <span class="role-badge role-${agent.role || 'listing'}">${agent.role || 'listing'}</span>
                              </span>
                            </div>
                            <div class="agent-row">
                              <span class="agent-label">Amount:</span>
                              <span class="agent-value amount-highlight">$${(agent.amount || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}</span>
                            </div>
                          </div>
                        `,
                          )
                          .join('')}
                      </div>
                    `;
                  }

                  contentHtml = `
                    <div class="history-details">
                      ${payload.details ? `<p><strong>Details:</strong> ${String(payload.details)}</p>` : ''}
                    </div>
                    ${payload.agencyAmount !== undefined ? `
                      <div class="agency-amount">
                        <p><strong>Agency Amount:</strong> <span class="amount">$${(payload.agencyAmount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</span></p>
                      </div>
                    ` : ''}
                    ${agentsHtml}
                  `;
                }
                // Handle AddListingAgent, AddSellingAgent, Update
                else {
                  const details = (entry.payload as { details?: string })
                    ?.details;
                  if (details) {
                    contentHtml = `
                      <div class="history-details">
                        <p><strong>Details:</strong> ${String(details)}</p>
                      </div>
                    `;
                  }
                }
              }

              return `
                <div class="history-item">
                  <div class="history-header">
                    <span class="history-type type-badge ${typeClass}">${entry.type}</span>
                    <span class="history-date">${date}</span>
                  </div>
                  <div class="history-content">
                    ${contentHtml || '<p><em>No additional details available</em></p>'}
                  </div>
                </div>
              `;
            })
            .join('');

    // Replace template placeholders
    template = template.replace(
      '{{generatedDate}}',
      new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
    );
    template = template.replace('{{transactionInfoHtml}}', transactionInfoHtml);
    template = template.replace('{{historyHtml}}', historyHtml);

    return template;
  }
}
