export default function Rules() {
  return (
    <div className="space-y-6 pb-8">
      <h2 className="text-xl font-bold">Library Rules & Guidelines</h2>
      
      <p className="text-sm text-gray-600">
        The Pride Platinum Community Library is a shared facility for residents to read, learn, and enjoy books in a quiet and welcoming environment.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm font-medium text-blue-800">📍 Library Timings: Every day, 7:00 PM to 8:00 PM</p>
        <p className="text-sm text-blue-700">Location: New Society Office</p>
      </div>

      <Section title="1. Library Access">
        <Li>The library is open to all Pride Platinum residents during the designated hours.</Li>
        <Li>Residents should enter and leave quietly and maintain a peaceful atmosphere.</Li>
        <Li>Children may use the library under appropriate supervision of their parents/guardians.</Li>
      </Section>

      <Section title="2. Issue & Return of Books">
        <Li>All book issues and returns will be managed exclusively through the Library Management App.</Li>
        <Li>Residents must use the App to check the availability of books and complete the issue/return process.</Li>
        <Li>A book will be considered officially issued only after the transaction is recorded in the App.</Li>
        <Li>Residents should return books through the App within the prescribed borrowing period.</Li>
        <Li>Please do not leave returned books unattended. Follow the App/library coordinator's instructions for the designated return process.</Li>
        <Li>Residents should verify that the return transaction has been successfully recorded in the App.</Li>
        <Li>Any problem with issuing or returning a book through the App should be reported to the library coordinator.</Li>
      </Section>

      <Section title="3. Care of Books">
        <Li>Please handle all books carefully and keep them clean and dry.</Li>
        <Li>Do not write, underline, fold pages, tear pages, or otherwise damage books.</Li>
        <Li>Any lost or damaged book must be reported promptly to the library coordinator.</Li>
        <Li>Residents may be asked to replace a lost or seriously damaged book, as determined by the Society Committee/library committee.</Li>
      </Section>

      <Section title="4. Conduct in the Library">
        <Li>Please maintain silence or speak softly inside the library.</Li>
        <Li>Mobile phones should be kept on silent mode.</Li>
        <Li>Food and drinks are not permitted near the books.</Li>
        <Li>Please leave the library neat and tidy after use.</Li>
        <Li>Respect other readers and avoid activities that may disturb them.</Li>
      </Section>

      <Section title="5. Library Management App">
        <Li>Residents are responsible for keeping their App account/details accurate and up to date.</Li>
        <Li>Borrowing history, due dates, and other library transactions will be maintained through the App.</Li>
        <Li>Residents should regularly check the App for due dates and pending returns.</Li>
        <Li>Any technical issue with the App should be brought to the attention of the library coordinator rather than being recorded manually unless specifically instructed.</Li>
      </Section>

      <Section title="6. Suggestions & Contributions">
        <Li>Residents are encouraged to suggest books for future purchase.</Li>
        <Li>Residents may also offer books for donation, subject to suitability and approval by the library committee.</Li>
        <Li>Suggestions for improving the library and the Library Management App are welcome.</Li>
      </Section>

      <Section title="7. Responsibility">
        <Li>The library is a community resource and its upkeep is a shared responsibility.</Li>
        <Li>Residents are requested to cooperate with the library volunteers/coordinators and follow these guidelines.</Li>
        <Li>The Society Committee/library committee may update these rules when necessary for the smooth functioning of the library.</Li>
      </Section>

      <p className="text-sm text-gray-600 italic text-center pt-4 border-t">
        Let us work together to make the Pride Platinum Library a quiet, well-managed, and enjoyable space for everyone.
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <ul className="space-y-1.5">{children}</ul>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">{children}</li>
}
