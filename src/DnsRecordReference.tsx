import { useState, useEffect, useMemo } from 'react'
import { Search, Sun, Moon, Languages, Globe, ChevronDown, ChevronUp, X } from 'lucide-react'

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'DNS Record Type Reference',
    subtitle: 'Interactive reference for all common DNS record types with examples and RFC links. Everything runs client-side.',
    searchPlaceholder: 'Search by type, description or RFC...',
    filterAll: 'All',
    filterCore: 'Core',
    filterMail: 'Mail',
    filterSecurity: 'Security',
    filterAdvanced: 'Advanced',
    type: 'Type',
    description: 'Description',
    format: 'Format',
    example: 'Example',
    rfc: 'RFC',
    noResults: 'No records match your search.',
    builtBy: 'Built by',
    records: 'records',
    expand: 'Expand',
    collapse: 'Collapse',
    ttlNote: 'TTL = Time To Live (seconds)',
  },
  pt: {
    title: 'Referencia de Tipos de Registro DNS',
    subtitle: 'Referencia interativa para todos os tipos comuns de registro DNS com exemplos e links para RFC. Tudo roda no navegador.',
    searchPlaceholder: 'Buscar por tipo, descricao ou RFC...',
    filterAll: 'Todos',
    filterCore: 'Principal',
    filterMail: 'E-mail',
    filterSecurity: 'Seguranca',
    filterAdvanced: 'Avancado',
    type: 'Tipo',
    description: 'Descricao',
    format: 'Formato',
    example: 'Exemplo',
    rfc: 'RFC',
    noResults: 'Nenhum registro encontrado para sua busca.',
    builtBy: 'Criado por',
    records: 'registros',
    expand: 'Expandir',
    collapse: 'Recolher',
    ttlNote: 'TTL = Tempo de Vida (segundos)',
  }
} as const

type Lang = keyof typeof translations

// ── DNS Records Data ──────────────────────────────────────────────────────────
type Category = 'core' | 'mail' | 'security' | 'advanced'

interface DnsRecord {
  type: string
  category: Category
  color: string
  description: { en: string; pt: string }
  format: string
  example: string
  rfc: string
  rfcUrl: string
  notes?: { en: string; pt: string }
}

const DNS_RECORDS: DnsRecord[] = [
  {
    type: 'A',
    category: 'core',
    color: '#3b82f6',
    description: {
      en: 'Maps a hostname to an IPv4 address. The most fundamental DNS record.',
      pt: 'Mapeia um nome de host para um endereco IPv4. O registro DNS mais fundamental.',
    },
    format: '<name> <ttl> IN A <ipv4-address>',
    example: 'example.com.  300  IN  A  93.184.216.34',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'Multiple A records can exist for the same name (round-robin load balancing). TTL controls caching duration.',
      pt: 'Multiplos registros A podem existir para o mesmo nome (balanceamento round-robin). TTL controla a duracao do cache.',
    },
  },
  {
    type: 'AAAA',
    category: 'core',
    color: '#6366f1',
    description: {
      en: 'Maps a hostname to an IPv6 address (128-bit). The IPv6 equivalent of the A record.',
      pt: 'Mapeia um nome de host para um endereco IPv6 (128 bits). Equivalente IPv6 do registro A.',
    },
    format: '<name> <ttl> IN AAAA <ipv6-address>',
    example: 'example.com.  300  IN  AAAA  2606:2800:220:1:248:1893:25c8:1946',
    rfc: 'RFC 3596',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc3596',
    notes: {
      en: 'AAAA stands for "IPv6 Address". The quad-A name reflects that IPv6 is 4x the size of IPv4.',
      pt: 'AAAA significa "endereco IPv6". O nome quad-A reflete que IPv6 e 4x o tamanho do IPv4.',
    },
  },
  {
    type: 'CNAME',
    category: 'core',
    color: '#8b5cf6',
    description: {
      en: 'Canonical Name — creates an alias from one name to another (the canonical name). Resolvers follow the chain.',
      pt: 'Nome Canonico — cria um alias de um nome para outro (o nome canonico). Resolvedores seguem a cadeia.',
    },
    format: '<alias> <ttl> IN CNAME <canonical-name>',
    example: 'www.example.com.  300  IN  CNAME  example.com.',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'A CNAME cannot coexist with other records for the same name. Cannot be used at zone apex (root domain). Use ALIAS/ANAME for root.',
      pt: 'Um CNAME nao pode coexistir com outros registros para o mesmo nome. Nao pode ser usado no apex de zona (dominio raiz). Use ALIAS/ANAME para raiz.',
    },
  },
  {
    type: 'MX',
    category: 'mail',
    color: '#f59e0b',
    description: {
      en: 'Mail Exchanger — specifies the mail server responsible for accepting email for the domain.',
      pt: 'Servidor de E-mail — especifica o servidor de e-mail responsavel por aceitar e-mails para o dominio.',
    },
    format: '<name> <ttl> IN MX <priority> <mail-server>',
    example: 'example.com.  300  IN  MX  10  mail.example.com.',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'Lower priority values are preferred. Multiple MX records provide redundancy. The mail-server must have an A/AAAA record.',
      pt: 'Valores de prioridade menores sao preferidos. Multiplos registros MX fornecem redundancia. O servidor de e-mail precisa ter um registro A/AAAA.',
    },
  },
  {
    type: 'TXT',
    category: 'core',
    color: '#10b981',
    description: {
      en: 'Holds arbitrary text data. Widely used for domain verification, SPF, DKIM, DMARC, and other policies.',
      pt: 'Armazena dados de texto arbitrarios. Amplamente usado para verificacao de dominio, SPF, DKIM, DMARC e outras politicas.',
    },
    format: '<name> <ttl> IN TXT "<text-string>"',
    example: 'example.com.  300  IN  TXT  "v=spf1 include:_spf.google.com ~all"',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'Max 255 chars per string but multiple strings can be concatenated. Used for SPF (email auth), DKIM public keys, DMARC policies, and domain ownership verification.',
      pt: 'Max 255 chars por string mas multiplas strings podem ser concatenadas. Usado para SPF (auth de e-mail), chaves publicas DKIM, politicas DMARC e verificacao de propriedade de dominio.',
    },
  },
  {
    type: 'NS',
    category: 'core',
    color: '#14b8a6',
    description: {
      en: 'Name Server — identifies the authoritative DNS server for the domain or a delegated subdomain.',
      pt: 'Servidor de Nomes — identifica o servidor DNS autoritativo para o dominio ou subdominio delegado.',
    },
    format: '<name> <ttl> IN NS <nameserver>',
    example: 'example.com.  86400  IN  NS  ns1.example.com.',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'NS records at zone apex delegate authority. NS records must have corresponding glue A records if the nameserver is within the same zone.',
      pt: 'Registros NS no apex de zona delegam autoridade. Registros NS precisam de registros A de cola correspondentes se o servidor de nomes estiver na mesma zona.',
    },
  },
  {
    type: 'SOA',
    category: 'core',
    color: '#ef4444',
    description: {
      en: 'Start of Authority — contains authoritative information about a DNS zone, including serial, refresh, retry, expire, and minimum TTL.',
      pt: 'Inicio de Autoridade — contem informacoes autoritativas sobre uma zona DNS, incluindo serial, refresh, retry, expire e TTL minimo.',
    },
    format: '<name> <ttl> IN SOA <mname> <rname> <serial> <refresh> <retry> <expire> <minimum>',
    example: 'example.com.  3600  IN  SOA  ns1.example.com.  hostmaster.example.com.  2024010101  3600  900  604800  86400',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'Every zone must have exactly one SOA record. The serial number must be incremented on every change. rname is the admin email (@ replaced by .).',
      pt: 'Toda zona deve ter exatamente um registro SOA. O numero serial deve ser incrementado a cada mudanca. rname e o e-mail do admin (@ substituido por .).',
    },
  },
  {
    type: 'PTR',
    category: 'core',
    color: '#64748b',
    description: {
      en: 'Pointer — maps an IP address back to a hostname. Used for reverse DNS lookups (rDNS).',
      pt: 'Ponteiro — mapeia um endereco IP de volta para um nome de host. Usado para buscas DNS reversas (rDNS).',
    },
    format: '<reversed-ip>.in-addr.arpa.  <ttl>  IN  PTR  <hostname>',
    example: '34.216.184.93.in-addr.arpa.  300  IN  PTR  example.com.',
    rfc: 'RFC 1035',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc1035',
    notes: {
      en: 'For IPv4: octets are reversed and .in-addr.arpa appended. For IPv6: use .ip6.arpa. Primarily used by email servers for spam filtering and network diagnostics.',
      pt: 'Para IPv4: octetos sao invertidos e .in-addr.arpa adicionado. Para IPv6: usar .ip6.arpa. Usado principalmente por servidores de e-mail para filtragem de spam e diagnostico de rede.',
    },
  },
  {
    type: 'SRV',
    category: 'advanced',
    color: '#f97316',
    description: {
      en: 'Service — specifies the location (hostname and port) of servers for specific services (e.g., SIP, XMPP, LDAP).',
      pt: 'Servico — especifica a localizacao (hostname e porta) de servidores para servicos especificos (ex: SIP, XMPP, LDAP).',
    },
    format: '_service._proto.name  <ttl>  IN  SRV  <priority> <weight> <port> <target>',
    example: '_sip._tcp.example.com.  300  IN  SRV  10  60  5060  sip.example.com.',
    rfc: 'RFC 2782',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc2782',
    notes: {
      en: 'Priority: lower is preferred. Weight: used for load distribution among same-priority servers. A "." target means the service is not available.',
      pt: 'Prioridade: menor e preferido. Peso: usado para distribuicao de carga entre servidores de mesma prioridade. Um alvo "." significa que o servico nao esta disponivel.',
    },
  },
  {
    type: 'CAA',
    category: 'security',
    color: '#ec4899',
    description: {
      en: 'Certification Authority Authorization — restricts which CAs are allowed to issue SSL/TLS certificates for the domain.',
      pt: 'Autorizacao de Autoridade de Certificacao — restringe quais CAs podem emitir certificados SSL/TLS para o dominio.',
    },
    format: '<name> <ttl> IN CAA <flags> <tag> "<value>"',
    example: 'example.com.  3600  IN  CAA  0  issue  "letsencrypt.org"',
    rfc: 'RFC 8659',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc8659',
    notes: {
      en: 'Tags: "issue" (single cert), "issuewild" (wildcard cert), "iodef" (report violations). Flags: 0=non-critical, 128=critical. Checked by CAs before issuing.',
      pt: 'Tags: "issue" (cert simples), "issuewild" (cert wildcard), "iodef" (relatar violacoes). Flags: 0=nao critico, 128=critico. Verificado por CAs antes de emitir.',
    },
  },
  {
    type: 'DNSKEY',
    category: 'security',
    color: '#a855f7',
    description: {
      en: 'DNS Key — holds public keys used for DNSSEC (DNS Security Extensions) to authenticate DNS data.',
      pt: 'Chave DNS — armazena chaves publicas usadas para DNSSEC (Extensoes de Seguranca DNS) para autenticar dados DNS.',
    },
    format: '<name> <ttl> IN DNSKEY <flags> <protocol> <algorithm> <public-key>',
    example: 'example.com.  3600  IN  DNSKEY  257  3  8  AwEAAba...==',
    rfc: 'RFC 4034',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc4034',
    notes: {
      en: 'Flags: 256=ZSK (Zone Signing Key), 257=KSK (Key Signing Key). Protocol is always 3. Common algorithms: 8=RSASHA256, 13=ECDSAP256SHA256. Part of DNSSEC chain of trust.',
      pt: 'Flags: 256=ZSK (Chave de Assinatura de Zona), 257=KSK (Chave de Assinatura de Chave). Protocolo e sempre 3. Algoritmos comuns: 8=RSASHA256, 13=ECDSAP256SHA256. Parte da cadeia de confianca DNSSEC.',
    },
  },
  {
    type: 'NAPTR',
    category: 'advanced',
    color: '#0ea5e9',
    description: {
      en: 'Naming Authority Pointer — allows rewriting of domain names via regular expressions. Used in ENUM (phone-to-URI) and SIP/VoIP.',
      pt: 'Ponteiro de Autoridade de Nomeacao — permite reescrita de nomes de dominio via expressoes regulares. Usado em ENUM (telefone-para-URI) e SIP/VoIP.',
    },
    format: '<name> <ttl> IN NAPTR <order> <pref> "<flags>" "<services>" "<regex>" <replacement>',
    example: '8.6.8.0.1.1.2.1.5.5.5.e164.arpa.  300  IN  NAPTR  100  10  "u"  "E2U+sip"  "!^.*$!sip:info@example.com!"  .',
    rfc: 'RFC 3403',
    rfcUrl: 'https://datatracker.ietf.org/doc/html/rfc3403',
    notes: {
      en: 'Order determines processing sequence (lower first). Pref controls selection among same-order records. Flags: "s"=SRV lookup, "a"=A/AAAA lookup, "u"=URI, "p"=application-specific.',
      pt: 'Ordem determina sequencia de processamento (menor primeiro). Pref controla selecao entre registros de mesma ordem. Flags: "s"=lookup SRV, "a"=lookup A/AAAA, "u"=URI, "p"=especifico da aplicacao.',
    },
  },
]

const CATEGORIES: { key: 'all' | Category; label: { en: string; pt: string } }[] = [
  { key: 'all', label: { en: 'All', pt: 'Todos' } },
  { key: 'core', label: { en: 'Core', pt: 'Principal' } },
  { key: 'mail', label: { en: 'Mail', pt: 'E-mail' } },
  { key: 'security', label: { en: 'Security', pt: 'Seguranca' } },
  { key: 'advanced', label: { en: 'Advanced', pt: 'Avancado' } },
]

const ACCENT = '#3b82f6'

// ── Component ─────────────────────────────────────────────────────────────────
export default function DnsRecordReference() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | Category>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const t = translations[lang]

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return DNS_RECORDS.filter(r => {
      const matchCat = category === 'all' || r.category === category
      const matchSearch = !q ||
        r.type.toLowerCase().includes(q) ||
        r.description[lang].toLowerCase().includes(q) ||
        r.rfc.toLowerCase().includes(q) ||
        r.example.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [search, category, lang])

  const toggleExpand = (type: string) => setExpanded(e => e === type ? null : type)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
              <Globe size={18} className="text-white" />
            </div>
            <span className="font-semibold">DNS Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/dns-record-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  style={category === cat.key ? { backgroundColor: ACCENT, color: '#fff', borderColor: ACCENT } : {}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${category === cat.key ? '' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-400">{filtered.length} {t.records}</p>

          {/* Records */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Globe size={32} className="mx-auto mb-3 opacity-30" />
              <p>{t.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(record => {
                const isExpanded = expanded === record.type
                return (
                  <div key={record.type} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <button
                      onClick={() => toggleExpand(record.type)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <span
                        className="shrink-0 w-16 text-center font-mono font-bold text-sm rounded-md py-1"
                        style={{ backgroundColor: `${record.color}20`, color: record.color }}
                      >
                        {record.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{record.description[lang].split('.')[0]}.</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          <a
                            href={record.rfcUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="hover:underline"
                            style={{ color: record.color }}
                          >
                            {record.rfc}
                          </a>
                          {' · '}
                          <span className="capitalize">{record.category}</span>
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-zinc-400 shrink-0" /> : <ChevronDown size={16} className="text-zinc-400 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">{record.description[lang]}</p>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-medium">{t.format}</p>
                            <pre className="text-xs font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all">{record.format}</pre>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-medium">{t.example}</p>
                            <pre className="text-xs font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all">{record.example}</pre>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: `${record.color}10`, borderLeft: `3px solid ${record.color}` }}>
                            <p className="text-zinc-600 dark:text-zinc-300">{record.notes[lang]}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-[10px] text-zinc-400">{t.ttlNote}</p>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:underline transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
