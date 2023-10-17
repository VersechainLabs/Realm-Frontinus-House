import { Accordion, Container } from 'react-bootstrap';
import classes from './FAQ.module.css';
import { useTranslation } from 'react-i18next';
import ReactHtmlParser from 'react-html-parser';
import SearchBar from '../../components/SeachBar';
import { useEffect, useState } from 'react';
import ErrorMessageCard from '../../components/ErrorMessageCard';
import NavBar from '../../components/NavBar';

interface ContentItem {
  title: string;
  content: React.ReactNode;
}

const content: ContentItem[] = [
  { title: 'faq1title', content: 'faq1answer' },
  { title: 'faq2title', content: 'faq2answer' },
  { title: 'faq3title', content: 'faq3answer' },
  { title: 'faq4title', content: 'faq4answer' },
  { title: 'faq5title', content: 'faq5answer' },
  { title: 'faq6title', content: 'faq6answer' },
  { title: 'faq7title', content: 'faq7answer' },
  { title: 'faq8title', content: 'faq8answer' },
  { title: 'faq9title', content: 'faq9answer' },
  { title: 'faq10title', content: 'faq10answer' },
  { title: 'faq11title', content: 'faq11answer' },
  { title: 'faq12title', content: 'faq12answer' },
  { title: 'faq13title', content: 'faq13answer' },
  { title: 'faq14title', content: 'faq14answer' },
  { title: 'faq15title', content: 'faq15answer' },
  { title: 'faq16title', content: 'faq16answer' },
  { title: 'faq17title', content: 'faq17answer' },
  { title: 'faq18title', content: 'faq18answer' },
  { title: 'faq19title', content: 'faq19answer' },
  { title: 'faq20title', content: 'faq20answer' },
  { title: 'faq21title', content: 'faq21answer' },
];

const FAQ = () => {
  const [input, setInput] = useState('');
  const [filteredFAQs, setfFilteredFAQs] = useState(content);

  const { t } = useTranslation();

  const handleFAQInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (input.length === 0) setfFilteredFAQs(content);

    setfFilteredFAQs(
      content.filter(c => {
        const query = input.toLowerCase();
        const question = c.title;
        const answer = c.content as string;

        return (
          t(question.toLowerCase()).indexOf(query) >= 0 ||
          t(answer.toLowerCase()).indexOf(query) >= 0
        );
      }),
    );
  }, [input, t]);

  return (
    <>
      {/*<div className="gradientBg">*/}
      {/*  <NavBar />*/}
      {/*  <Container>*/}
      {/*    <div className={classes.searchWrapper}>*/}
      {/*      <h1 className={classes.title}>{t('frequentlyAsked')}</h1>*/}

      {/*      <SearchBar*/}
      {/*        input={input}*/}
      {/*        handleSeachInputChange={handleFAQInputChange}*/}
      {/*        placeholder={t('searchForQuestions')}*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*  </Container>*/}
      {/*</div>*/}

      {/*<Container className={classes.faqBackground}>*/}
      {/*  {filteredFAQs.length === 0 ? (*/}
      {/*    <ErrorMessageCard message={t('noFaqsFound')} />*/}
      {/*  ) : (*/}
      {/*    <Accordion className={classes.accordion}>*/}
      {/*      {filteredFAQs.map((item, i) => (*/}
      {/*        <div key={item.title}>*/}
      {/*          <Accordion.Item eventKey={`${i}`} className={classes.accordionItem}>*/}
      {/*            <Accordion.Header>{t(filteredFAQs[i].title)}</Accordion.Header>*/}
      {/*            <Accordion.Body>*/}
      {/*              {ReactHtmlParser(t(`${filteredFAQs[i].content}`))}*/}
      {/*            </Accordion.Body>*/}
      {/*          </Accordion.Item>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </Accordion>*/}
      {/*  )}*/}
      {/*</Container>*/}


      <div className="gradientBg">
        {/*<NavBar />*/}
        <Container>
          <div className={classes.searchWrapper}>

            {/*<SearchBar*/}
            {/*    input={input}*/}
            {/*    handleSeachInputChange={handleFAQInputChange}*/}
            {/*    placeholder={t('searchForQuestions')}*/}
            {/*/>*/}
          </div>
        </Container>
      </div>

      <Container className={classes.faqBackground}>
        <div className={classes.title}>Frontinus House Charter</div>

        <div className={classes.minTitle} >
          Frontinus and BibliothecaDAO
        </div>
        <div className={classes.text}>
          The Frontinus House Charter is here to establish a framework in which Frontinus House can work with the BibliothecDAO. The aim of Frontinus House is to establish a way to incentivise teams to work in the BibliothecaDAO ecosystem, fleshing out a living Autonomous World and the infrastructure to maintain that.
        </div>
        <div className={classes.text}>
          Frontinus House Charter is here to build within the constitution of BibliothecaDAO and follow the key aims of Autonomous Worlds - Valuing permissionless, open-source, interoperable and decentralised blockchain protocols.
        </div>
        <div className={classes.minTitle} >
          The Charter - Rules we must live by
        </div>
        <div className={classes.desc}>
          Frontinus House is a public good
        </div>
        <div className={classes.text}>
          An open-source credibly neutral platform for funding of builders within the Realms Autonomous World and Starknet Ecosystem. This relies on 3 components Frontinus House must adhere to:
        </div>
        <div className={classes.text}>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Immutable onchain protocol</div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Permissionless access</div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Open-source nature</div>
          </div>
        </div>

        <div className={classes.text}>
          Frontinus House specialises within Autonomous Worlds and Fully Onchain Gaming but is not tied to funding within these worlds. Credible neutrality will allow to prop up any ecosystem.
        </div>
        <div className={classes.text}>
          Immutability - Frontinus House aims to be an incorruptible mechanism for funding builders as such the protocol aims to run as autonomously as possible, fully onchain without centralised components.
        </div>
        <div className={classes.text}>
          Permissionless - Actors seeking to apply to grants or publish a grant can do so without authorisation.
        </div>
        <div className={classes.text}>
          Opensource - BibliothecaDAO believes in opensource building and at all times will prompt builders to work within an opensource framework.
        </div>
        <div className={classes.desc}>
          Align builders with ecosystems
        </div>
        <div className={classes.text}>
          Frontinus house aims to incentivise builders within autonomous worlds and to be invested within them. We always recommend funding builders with ecosystem tokens over strictly ethereum or stablecoins.
        </div>
        <div className={classes.minTitle} >Builders Constitution</div>
        <div className={classes.text}>
          When builders apply for a grant within the Frontinus House Mechanism they must act to the standards of the layed out below.
        </div>
        <div className={classes.text}>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Understanding: Builders should ensure they have a complete understanding of the bounty objectives they put forward. They should consider the technical requirements, the desired outcomes, and any constraints specified in the proposal and if they are achievable.
            </div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Transparency: Builders should be transparent about their skills, experiences, and resources. They should disclose any potential conflicts of interest.
            </div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Communication: Builders should communicate effectively. They should be prepared to ask questions to clarify bounty requirements and to respond to questions about their proposals.
            </div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Quality Assurance: Builders should outline their approach to quality assurance and testing in their proposals. They should be prepared to explain how they will ensure any protocol component is robust, secure, and reliable.
            </div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Compliance: Builders should respect intellectual property rights and other relevant laws and regulations.
            </div>
          </div>
          <div className={classes.listMain}>
            <div className={classes.dian}>·</div>
            <div className={classes.list}>Feedback: Builders should be open to receiving and responding to feedback on their proposals. They should be prepared to revise their proposals based on feedback from the the funding instigator.
            </div>
          </div>
        </div>

        <div className={classes.text}>
          Proposals within Frontinus House will assume to be open-source unless explicitly notes within the builders proposal.
        </div>
      </Container>
    </>
  );
};

export default FAQ;
